/**
 * @file Booking.js
 * @description Mongoose schema for programme booking records.
 *
 * A Booking is created when a user completes the booking wizard on a
 * programme detail page — whether they paid a contribution or chose to
 * skip the payment step. It links a Clerk user ID to a Programme document
 * so the listing page can show "Registered" on cards the user has booked.
 */
const mongoose = require("mongoose");

/**
 * @typedef {Object} BookingDocument
 * @property {string}   clerkUserId  - Clerk's user ID (from the auth token)
 * @property {ObjectId} programmeId  - Reference to the booked Programme document
 * @property {boolean}  paid         - true if the user made a contribution; false if skipped
 * @property {number}   amount       - Contribution amount in pounds; 0 if skipped
 * @property {Date}     createdAt    - Auto-set by Mongoose timestamps
 * @property {Date}     updatedAt    - Auto-set by Mongoose timestamps
 */
const BookingSchema = new mongoose.Schema(
  {
    // Clerk's unique user identifier, taken from the verified auth token.
    // This is how we know which user made the booking without storing
    // a separate users collection in MongoDB.
    clerkUserId: { type: String, required: true },

    // The programme being booked.
    programmeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },

    // Whether the user made a financial contribution at booking time.
    paid: { type: Boolean, default: false },

    // Contribution amount in pounds (£). 0 if the user clicked "Skip for now".
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index ensures one booking per user per programme.
// Attempting to book the same programme twice will throw a duplicate key error.
BookingSchema.index({ clerkUserId: 1, programmeId: 1 }, { unique: true });

module.exports = mongoose.model("Booking", BookingSchema);
