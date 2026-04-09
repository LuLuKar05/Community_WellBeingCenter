/**
 * @file Programme.js
 * @description Mongoose schema and model for community programme records.
 *
 * Each document represents a single class, workshop, or event offered by the
 * Community Wellbeing Center. Documents are queried by the programmes API
 * with optional search and filter parameters (category, day, time of day).
 */
const mongoose = require("mongoose");

/**
 * @typedef {Object} ProgrammeDocument
 * @property {string} title        - Name of the programme (required)
 * @property {string} description  - Short description shown on the card
 * @property {string} category     - One of four category buckets (required)
 * @property {string} day          - Day of the week the programme runs (required)
 * @property {string} time         - Time bucket: "Morning" | "Afternoon" | "Evening" (required)
 * @property {string} timeStr      - Human-readable time, e.g. "8:00 AM" (required)
 * @property {string} instructor   - Name of the facilitator or instructor
 * @property {number} capacity     - Maximum number of participants (default: 20)
 * @property {number} enrolled     - Current number of enrolments (default: 0)
 * @property {number} price        - Session price in pounds; 0 means free (default: 0)
 * @property {string} image        - URL of the programme thumbnail image
 * @property {Date}   createdAt    - Auto-set by Mongoose timestamps
 * @property {Date}   updatedAt    - Auto-set by Mongoose timestamps
 */
const ProgrammeSchema = new mongoose.Schema(
  {
    // The display name of the programme shown as the card heading.
    title: { type: String, required: true, trim: true },

    // A concise description of the session's goals and content.
    description: { type: String, required: true, trim: true },

    // High-level category used by the FilterSidebar on the programmes page.
    // Must match exactly one of the four enum values.
    category: {
      type: String,
      required: true,
      enum: ["Movement & Yoga", "Mental Health", "Community Support", "Events"],
    },

    // The day of the week the programme is scheduled.
    // Enum prevents free-text variations ("Mon" vs "Monday", etc.).
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },

    // Broad time-of-day bucket used by the FilterSidebar time filters.
    // "Morning" = before 12pm, "Afternoon" = 12pm–5pm, "Evening" = after 5pm.
    time: {
      type: String,
      required: true,
      enum: ["Morning", "Afternoon", "Evening"],
    },

    // Human-readable time string displayed on the card, e.g. "8:00 AM".
    // Kept separate from `time` so filters work on buckets while the card
    // shows the exact scheduled time.
    timeStr: { type: String, required: true },

    // Name of the instructor or group facilitator leading the session.
    instructor: { type: String, default: "" },

    // Maximum number of participants permitted in this programme.
    capacity: { type: Number, default: 20 },

    // Running count of current enrolments. Must not exceed capacity.
    enrolled: { type: Number, default: 0 },

    // Price per session in pounds sterling. 0 indicates the session is free.
    price: { type: Number, default: 0 },

    // Full URL of the programme's thumbnail image.
    // Used as the src prop for the Next.js <Image> component in Card.jsx.
    image: { type: String, default: "" },
  },
  // timestamps: true automatically adds and manages createdAt and updatedAt.
  { timestamps: true }
);

module.exports = mongoose.model("Programme", ProgrammeSchema);
