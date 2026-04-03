/**
 * @file server.js
 * @description Application entry point for the Community Wellbeing Center backend.
 *
 * This file is intentionally kept minimal. Its only responsibilities are:
 *   1. Load environment variables from .env
 *   2. Connect to MongoDB
 *   3. Create the Express application
 *   4. Mount global middleware (CORS, body parsing)
 *   5. Mount route handlers
 *   6. Mount the centralized error handler (must always be last)
 *   7. Start the HTTP server
 *
 * All business logic lives in /controllers.
 * All URL routing lives in /routes.
 * The database connection logic lives in /config/db.js.
 * Error handling lives in /middleware/errorHandler.js.
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorHandler");

// ─── 1. Connect to Database ───────────────────────────────────────────────────
// connectDB() logs success or exits the process on failure so the server
// never starts in a state where it cannot reach the database.
connectDB();

// ─── 2. Create Express App ────────────────────────────────────────────────────
const app = express();

// ─── 3. Global Middleware ─────────────────────────────────────────────────────

// Allow cross-origin requests from the React/Next.js frontend.
// CLIENT_URL defaults to localhost:3000 for local development.
// In production, set CLIENT_URL in .env to the deployed frontend URL
// (e.g. https://yourapp.com) so the CORS policy is properly restricted.
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

// IMPORTANT — paymentRoutes MUST be mounted BEFORE express.json():
//
// The /api/webhook route inside paymentRoutes uses express.raw() to keep
// the body as a raw Buffer. Stripe verifies its cryptographic signature
// against those exact raw bytes. If express.json() ran first, it would
// parse and re-serialise the body, changing the bytes and breaking the
// signature check — every legitimate webhook would be rejected with 400.
app.use("/api", paymentRoutes);

// Parse JSON request bodies for all routes registered after this point.
// (paymentRoutes is already mounted above and handles its own body parsing.)
app.use(express.json());

// ─── 4. Mount Routes ──────────────────────────────────────────────────────────
app.use("/api", chatRoutes);

// ─── 5. Centralized Error Handler ────────────────────────────────────────────
// This MUST be the last app.use() call. Express identifies error-handling
// middleware by its four-parameter signature (err, req, res, next).
// Controllers call next(error) to route errors here instead of writing
// repetitive res.status(500).json(...) blocks in every route.
app.use(errorHandler);

// ─── 6. Start Server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
