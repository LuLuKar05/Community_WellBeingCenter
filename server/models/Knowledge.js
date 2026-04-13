/**
 * @file Knowledge.js
 * @description Mongoose schema and model for the AI knowledge base.
 *
 * Each document in the "knowledge_base" collection stores one chunk of
 * text about the Community Wellbeing Center along with its vector embedding.
 * A vector embedding is a list of 1536 numbers that numerically encodes the
 * semantic meaning of the text — sentences with similar meanings produce
 * similar vectors.
 *
 * These documents are created by running scripts/ingest.js, which sends each
 * text chunk to OpenAI's text-embedding-3-small model and stores both the
 * original text and the resulting vector here.
 *
 * At query time, the chatbot controller (controllers/chatController.js)
 * converts the user's question into a vector and uses MongoDB Atlas Vector
 * Search to find the documents whose embeddings are closest — meaning the
 * most semantically relevant passages are retrieved and passed to the AI.
 */
const mongoose = require("mongoose");

/**
 * @typedef {Object} KnowledgeDocument
 * @property {string}   text      - The original human-readable text chunk
 * @property {number[]} embedding - 1536-dimensional vector from text-embedding-3-small
 * @property {Date}     createdAt - Auto-set by Mongoose timestamps
 * @property {Date}     updatedAt - Auto-set by Mongoose timestamps
 */
const KnowledgeSchema = new mongoose.Schema(
  {
    // The original text passage — this is what the chatbot quotes in its answers.
    text: {
      type: String,
      required: true,
    },

    // The vector embedding: an array of 1536 floating-point numbers.
    // MongoDB Atlas stores this as a BSON array and can perform efficient
    // approximate-nearest-neighbour searches over it using the vector_index.
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

// IMPORTANT: The third argument "knowledge_base" explicitly sets the MongoDB
// collection name. Mongoose would default to "knowledges" (pluralised), which
// would NOT match the collection name used when configuring the Vector Search
// index in MongoDB Atlas. Explicit naming prevents this mismatch.
//
// The mongoose.models.Knowledge check prevents OverwriteModelError if this
// module is imported more than once (e.g. during hot-reload in development).
module.exports =
  mongoose.models.Knowledge ||
  mongoose.model("Knowledge", KnowledgeSchema, "knowledge_base");
