/**
 * @file db.js
 * @description Handles the MongoDB connection using Mongoose.
 *
 * Separating the database connection into its own module keeps server.js
 * clean and makes it easy to test the connection logic independently.
 * If the connection fails on startup, the process exits immediately so
 * a process manager (e.g. PM2) can restart it rather than serving
 * requests with no database.
 */
require("dotenv").config();
const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Exits the Node.js process with code 1 if the connection fails,
 * because the application cannot function without a database.
 *
 * @async
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Terminate the process so the server doesn't start in a broken state.
    process.exit(1);
  }
}

module.exports = connectDB;
