/**
 * @file ingest.js
 * @description One-time data ingestion script for the AI knowledge base.
 *
 * Run this script manually whenever the center's information changes
 * (opening hours, pricing, class schedule, etc.). It clears the existing
 * knowledge_base collection and repopulates it with fresh embeddings.
 *
 * WHAT THIS SCRIPT DOES:
 *   1. Connects to MongoDB.
 *   2. Clears all existing documents from the knowledge_base collection.
 *   3. For each text chunk in the centerData array:
 *      a. Sends the text to OpenAI to generate a 1536-number vector embedding.
 *      b. Saves both the original text and its vector to MongoDB.
 *
 * After this script completes, the MongoDB Atlas Vector Search index
 * (named "vector_index" on the "embedding" field) will index the new data
 * and the chatbot will be able to retrieve relevant passages.
 *
 * HOW TO RUN (from the server/ directory):
 *   node scripts/ingest.js
 *
 * REQUIREMENTS:
 *   - OPENAI_API_KEY must be set in server/.env
 *   - MONGO_URI must be set in server/.env
 *   - MongoDB Atlas with Vector Search enabled
 *   - The "vector_index" search index must exist on knowledge_base.embedding
 *     (create it manually in the Atlas UI — it is not created by this script)
 */
const path = require("path");
// Use __dirname so the .env path resolves correctly regardless of which
// directory the script is run from. __dirname = server/scripts/, so
// path.resolve(__dirname, "../.env") always points to server/.env.
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const OpenAI = require("openai");
const Knowledge = require("../models/Knowledge");

// Initialise the OpenAI client using the API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * The source content for the AI knowledge base.
 *
 * Each string is one "chunk" — a discrete, self-contained piece of information
 * about the center. The chatbot retrieves whole chunks, so keep each one
 * focused on a single topic (2–4 sentences is ideal). Large, mixed-topic
 * chunks dilute the relevance of search results.
 *
 * TO UPDATE: Edit the strings below and re-run this script.
 * The script wipes and rebuilds the collection on every run, so old data
 * is replaced automatically — no manual cleanup needed.
 */
const centerData = [
  "The Community Wellbeing Center is open Monday through Friday from 8:00 AM to 8:00 PM, and Saturdays from 9:00 AM to 5:00 PM. We are closed on Sundays.",
  "We operate on a sliding-scale pricing model to ensure accessibility. The Community Rate is £5, the Standard Rate is £15, and the Pay-It-Forward rate is £25.",
  "Morning Flow Yoga is a physical health class held every Tuesday and Thursday at 10:00 AM in the Main Hall. It is suitable for all physical levels.",
  "Art Therapy is a mental wellbeing peer support group held every Wednesday at 2:00 PM. No prior art experience is needed.",
  "Facility rentals are available for community members. The Main Hall costs £50 per hour and requires a deposit. The Community Kitchen costs £30 per hour.",
  "To book a class, users must click the 'Schedule' tab on the website, select their class, choose their sliding-scale tier, and pay via Stripe. We do not take cash at the door.",
];

/**
 * Main ingestion function.
 * Connects to MongoDB, wipes the existing knowledge base, then generates
 * and stores a vector embedding for each text chunk in centerData.
 *
 * @async
 * @returns {Promise<void>}
 */
async function runIngestion() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete all existing documents so re-running the script doesn't create
    // duplicates. This is safe because the data is fully rebuilt from centerData.
    await Knowledge.deleteMany({});
    console.log("Cleared existing knowledge base entries");

    for (const text of centerData) {
      // Send the text chunk to OpenAI and receive a 1536-number vector.
      // The model MUST be "text-embedding-3-small" to match the dimensions
      // expected by the MongoDB Atlas Vector Search index. Using a different
      // model would produce incompatible vectors and break search results.
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      // Save the original text alongside its vector embedding.
      // The chatbot retrieves the "text" field to build the AI's context.
      // The "embedding" field is what Atlas uses for similarity search.
      await Knowledge.create({
        text,
        embedding: response.data[0].embedding,
      });

      console.log(`Saved: "${text.substring(0, 50)}..."`);
    }

    console.log("Ingestion complete. The knowledge base is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Ingestion failed:", error);
    process.exit(1);
  }
}

runIngestion();
