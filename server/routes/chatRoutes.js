/**
 * @file chatRoutes.js
 * @description Express Router for the AI chatbot endpoint.
 *
 * This router is mounted after express.json() in server.js so that
 * req.body is automatically parsed from JSON before reaching the controller.
 */
const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/chatController");

/**
 * POST /api/chat
 *
 * Accepts a user message and returns an AI-generated reply grounded in
 * the knowledge base via the RAG (Retrieval-Augmented Generation) pipeline.
 *
 * Request body:  { message: string }
 * Response body: { reply: string }
 */
router.post("/chat", handleChat);

module.exports = router;
