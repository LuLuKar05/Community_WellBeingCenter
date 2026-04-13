/**
 * @file chatController.js
 * @description Business logic for the AI chatbot endpoint.
 *
 * This controller implements a RAG (Retrieval-Augmented Generation) pipeline.
 * RAG is a technique that makes AI responses factually grounded by first
 * searching a curated knowledge base and then feeding only the relevant
 * passages to the language model as context. Without RAG, the model would
 * answer from general training data and could "hallucinate" incorrect
 * opening hours, prices, or services.
 *
 * The three-step pipeline is:
 *
 *   1. EMBED   — Convert the user's question into a vector (an array of 1536
 *                numbers) using OpenAI's text-embedding-3-small model. A vector
 *                is a mathematical representation of meaning: semantically
 *                similar sentences produce similar vectors.
 *
 *   2. RETRIEVE — Query MongoDB Atlas Vector Search with that vector to find
 *                 the 3 most semantically similar passages in the knowledge base.
 *                 These passages become the "context" for the AI's answer.
 *
 *   3. GENERATE — Send the retrieved context + the user's question to the
 *                 FLock/Z.AI language model. The system prompt instructs the
 *                 model to answer ONLY from the provided context, preventing
 *                 hallucination. The model returns a natural language reply.
 *
 * To add new information the chatbot can talk about, update centerData in
 * scripts/ingest.js and re-run that script.
 */
const OpenAI = require("openai");
const Knowledge = require("../models/Knowledge"); // FIX: was missing in original server.js

// ─── AI Client Initialisation ─────────────────────────────────────────────────

/**
 * OpenAI client used exclusively for generating text embeddings.
 * Embeddings are what allow us to measure how similar two pieces of text are.
 * Uses the standard OPENAI_API_KEY — this is a separate account/billing from FLock.
 */
const embedder = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * FLock/Z.AI client used for generating chat completion responses.
 * FLock uses an OpenAI-compatible API, so we can reuse the openai SDK
 * but point it at the FLock endpoint and use the FLock API key.
 *
 * NOTE FOR DEVELOPERS: You must set FLOCK_BASE_URL and FLOCK_API_KEY in
 * your .env file before the chatbot will work. The original code had a
 * hard-coded placeholder URL and incorrectly used the OpenAI key here.
 * Contact the project lead for the real Z.AI endpoint URL.
 */
const flockAI = new OpenAI({
  apiKey: process.env.FLOCK_API_KEY, // FIX: now uses its own dedicated key
  baseURL: process.env.FLOCK_BASE_URL, // FIX: read from .env, not hard-coded
});

// ─── Controller Function ──────────────────────────────────────────────────────

/**
 * Handles an incoming chat message using the RAG pipeline.
 *
 * Route: POST /api/chat
 *
 * Expected request body:
 * @param {Object} req.body
 * @param {string} req.body.message - The user's question or message
 *
 * Success response (200):
 * @returns {{ reply: string }} - The AI-generated response
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function handleChat(req, res, next) {
  try {
    const { message: userMessage, history: chatHistory = [] } = req.body; // Destructure both message and chat history from the request body

    // --- Input Validation ---
    // Without this check, a missing or empty message would cause the OpenAI
    // embeddings call to throw an error with a confusing API-level message
    // rather than a clear 400 response.
    if (
      !userMessage ||
      typeof userMessage !== "string" ||
      !userMessage.trim()
    ) {
      return res
        .status(400)
        .json({ error: "A non-empty message is required." });
    }
    // --- The Guardrail Intercept ---
    // We ask FLock to do a lightning-fast YES/NO check on the user's intent
    const guardrailResponse = await embedder.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Analyze the user's text. Is this person expressing a genuine, immediate medical emergency, or an intent to commit suicide or severe physical harm? Reply strictly with the word 'YES' or 'NO' and absolutely nothing else.",
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 5,
      temperature: 0, // Adding this makes the AI act like a robot, not a human
    });
    const isCrisis = guardrailResponse.choices[0].message.content
      .trim()
      .toUpperCase();
    console.log("Guardrail Output:", isCrisis); // Added this so you can see it in your server terminal!

    // If it is a crisis, stop the server from doing RAG and immediately return the emergency response!
    if (isCrisis.includes("YES")) {
      return res.json({
        reply: "CRISIS_ALERT",
        message:
          "Your safety is our priority. If you are experiencing an emergency, please call 999 or go to your nearest A&E immediately. For 24/7 mental health support, call the Samaritans at 116 123.",
      });
    }
    // ── STEP 1: EMBED ──────────────────────────────────────────────────────
    // Convert the user's question into a 1536-number vector.
    // The embedding model must match what was used during ingestion
    // (text-embedding-3-small) so vectors are in the same "space" and
    // comparisons between them are meaningful.
    const embeddingResponse = await embedder.embeddings.create({
      model: "text-embedding-3-small",
      input: userMessage,
    });
    // Extract the vector from the API response
    const questionVector = embeddingResponse.data[0].embedding;

    // ── STEP 2: RETRIEVE ───────────────────────────────────────────────────
    // Use MongoDB Atlas Vector Search to find the 3 most relevant passages
    // from our knowledge_base collection. Atlas compares the questionVector
    // against all stored embeddings and returns the closest matches.
    //
    // Requirements for this to work:
    //   - MongoDB Atlas (not local MongoDB) with Vector Search enabled
    //   - A search index named "vector_index" on the "embedding" field
    //     in the "knowledge_base" collection
    //   - The knowledge_base must be populated by running scripts/ingest.js
    const searchResults = await Knowledge.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Must match the index name in Atlas
          path: "embedding", // The field holding the stored vectors
          queryVector: questionVector, // The embedding of the user's question
          numCandidates: 10, // Atlas considers this many candidates...
          limit: 3, // ...and returns only the top 3
        },
      },
    ]);

    // Concatenate the retrieved text chunks into a single context string.
    // These are the passages the AI is permitted to draw from in its answer.
    const databaseContext = searchResults
      .map((result) => result.text)
      .join("\n\n");

    // ── STEP 3: GENERATE ───────────────────────────────────────────────────
    // Build the system prompt that defines the chatbot's persona and injects
    // the retrieved context. The model is instructed to answer ONLY from this
    // context — if the answer isn't there, it should say so rather than guess.
    const systemPrompt = `
      You are a warm, highly empathetic receptionist for the Community Wellbeing Center.
      If a user expresses stress or physical discomfort, validate their feelings warmly,
      state you cannot provide medical advice, and suggest 1-2 relevant services.
      Do NOT assist users in navigating external websites.
      ONLY use the following database context to answer questions.
      If the answer is not in the context, politely say you don't know.

      DATABASE CONTEXT:
      ${databaseContext}
    `;

    // Send the system prompt + user message to FLock/Z.AI for a response.
    // The "Z.AI" model name may need updating once the real model identifier
    // is confirmed with the project lead.
    const chatResponse = await flockAI.chat.completions.create({
      model: "glm-5",
      messages: [
        // system: sets the chatbot's persona and restricts it to the context
        { role: "system", content: systemPrompt },
        ...chatHistory, // Include previous chat history for conversational context (if any)
        // user: the actual question from the frontend
        { role: "user", content: userMessage },
      ],
    });

    // Extract the model's text reply and send it back to the frontend
    res.json({ reply: chatResponse.choices[0].message.content });
  } catch (error) {
    // Hand off to the centralized error handler in middleware/errorHandler.js
    next(error);
  }
}

module.exports = { handleChat };
