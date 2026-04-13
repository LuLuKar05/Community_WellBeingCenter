/**
 * @file programmeRoutes.js
 * @description Express router for the Programmes API.
 *
 * Defines three endpoints:
 *   GET  /api/programmes       — list all programmes (with optional search/filter)
 *   GET  /api/programmes/:id   — fetch a single programme by MongoDB _id
 *   POST /api/programmes       — create a new programme (admin / seed use)
 *
 * All business logic lives in programmeController.js — this file only maps
 * HTTP verbs + paths to the correct controller function.
 *
 * Mounted in server.js as: app.use("/api", programmeRoutes)
 */
const express = require("express");
const router = express.Router();

const {
  getAllProgrammes,
  getProgrammeById,
  createProgramme,
} = require("../controllers/programmeController");

// List all programmes, with optional ?search=, ?category=, ?day=, ?time= params
router.get("/programmes", getAllProgrammes);

// Fetch a single programme by its MongoDB ObjectId
router.get("/programmes/:id", getProgrammeById);

// Create a new programme (used by the seed script and future admin UI)
router.post("/programmes", createProgramme);

module.exports = router;
