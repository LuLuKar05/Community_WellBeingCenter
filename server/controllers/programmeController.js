/**
 * @file programmeController.js
 * @description Business logic for the Programmes API.
 *
 * Three responsibilities:
 *
 * 1. LIST — getAllProgrammes returns all programmes that match optional
 *    query parameters for full-text search (title/description) and
 *    multi-select filters (category, day, time). The frontend sends these
 *    params whenever the user types in the search box or clicks a filter chip.
 *
 * 2. DETAIL — getProgrammeById returns a single programme by its MongoDB _id.
 *    Used by the individual programme detail page (/programmes/[id]).
 *
 * 3. CREATE — createProgramme inserts a new programme document. Intended for
 *    admin use and the seed script only — no authentication guard is added
 *    here yet, but one should be added before going to production.
 */
const Programme = require("../models/Programme");

// ─── Controller Functions ─────────────────────────────────────────────────────

/**
 * Returns all programmes matching the provided search and filter query params.
 *
 * Route: GET /api/programmes
 *
 * Supported query parameters (all optional, all combinable):
 * @param {string} [req.query.search]   - Case-insensitive text to match against title or description
 * @param {string} [req.query.category] - Comma-separated list of categories, e.g. "Movement & Yoga,Events"
 * @param {string} [req.query.day]      - Comma-separated days, e.g. "Tuesday,Thursday"
 * @param {string} [req.query.time]     - Comma-separated time buckets, e.g. "Morning,Evening"
 *
 * Success response (200):
 * @returns {ProgrammeDocument[]} Array of matching programme documents, sorted by day then timeStr
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getAllProgrammes(req, res, next) {
  try {
    const { search, category, day, time } = req.query;

    // Build the Mongoose query object incrementally.
    // Only add a condition when the corresponding param was supplied —
    // omitting a condition means "no restriction on this field".
    const query = {};

    if (search && search.trim()) {
      // $or + $regex gives a case-insensitive partial match across both fields.
      // This is simpler than Atlas Search for a small dataset and avoids
      // the requirement of a separate Atlas Search index.
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // category, day, and time all support comma-separated multi-select values
    // (e.g. ?category=Movement+%26+Yoga,Events). $in checks whether the
    // document's field value appears anywhere in the provided array.
    if (category) {
      query.category = { $in: category.split(",").map((v) => v.trim()) };
    }

    if (day) {
      query.day = { $in: day.split(",").map((v) => v.trim()) };
    }

    if (time) {
      query.time = { $in: time.split(",").map((v) => v.trim()) };
    }

    // Sort by day (alphabetical) then timeStr so results appear in a
    // logical schedule order on the page.
    const programmes = await Programme.find(query).sort({ day: 1, timeStr: 1 });

    res.json(programmes);
  } catch (error) {
    next(error);
  }
}

/**
 * Returns a single programme by its MongoDB document ID.
 *
 * Route: GET /api/programmes/:id
 *
 * @param {string} req.params.id - MongoDB ObjectId string
 *
 * Success response (200): { ProgrammeDocument }
 * Not-found response (404): { error: "Programme not found" }
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getProgrammeById(req, res, next) {
  try {
    const programme = await Programme.findById(req.params.id);

    if (!programme) {
      return res.status(404).json({ error: "Programme not found" });
    }

    res.json(programme);
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a new Programme document in the database.
 *
 * Route: POST /api/programmes
 *
 * Expected request body: all required Programme fields
 * (title, description, category, day, time, timeStr)
 *
 * Success response (201): { ProgrammeDocument }
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function createProgramme(req, res, next) {
  try {
    const programme = await Programme.create(req.body);
    res.status(201).json(programme);
  } catch (error) {
    // Mongoose ValidationError (missing required fields, invalid enum) will
    // have a 400-appropriate message — the errorHandler reads err.status.
    if (error.name === "ValidationError") {
      error.status = 400;
    }
    next(error);
  }
}

module.exports = { getAllProgrammes, getProgrammeById, createProgramme };
