/**
 * @file bookingController.js
 * @description Business logic for programme bookings.
 *
 * Two responsibilities:
 *
 * 1. CREATE — Records that a Clerk user has booked a programme, with an
 *    optional contribution amount. Called from the BookingWizard after
 *    the user reaches step 4 (confirmation), whether they paid or skipped.
 *
 * 2. LIST MINE — Returns the programme IDs of all programmes the current
 *    user has booked. Used by the listing page to show "Registered" on
 *    cards the user has already booked.
 *
 * Auth: Both routes require a valid Clerk session token sent as
 * `Authorization: Bearer <token>`. The token is verified by @clerk/express
 * clerkMiddleware() in server.js; getAuth(req) extracts the userId.
 */
const { getAuth } = require("@clerk/express");
const Booking = require("../models/Booking");

// ─── Controller Functions ─────────────────────────────────────────────────────

/**
 * Creates a booking record for the authenticated user.
 *
 * Route: POST /api/bookings
 *
 * Expected request body:
 * @param {string}  req.body.programmeId - MongoDB ObjectId of the programme
 * @param {boolean} [req.body.paid=false] - Whether a contribution was made
 * @param {number}  [req.body.amount=0]  - Contribution amount in pounds
 *
 * Success response (201): { BookingDocument }
 * Auth error  (401): { error: "Authentication required" }
 * Duplicate   (409): { error: "Already booked" }
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function createBooking(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { programmeId, paid = false, amount = 0 } = req.body;

    if (!programmeId) {
      return res.status(400).json({ error: "programmeId is required" });
    }

    const booking = await Booking.create({
      clerkUserId: userId,
      programmeId,
      paid,
      amount,
    });

    res.status(201).json(booking);
  } catch (error) {
    // MongoDB duplicate key error (code 11000) means the user already booked
    // this programme — the unique compound index (clerkUserId + programmeId)
    // enforces one booking per user per programme.
    if (error.code === 11000) {
      return res.status(409).json({ error: "Already booked" });
    }
    next(error);
  }
}

/**
 * Returns all bookings for the currently authenticated user.
 *
 * Route: GET /api/bookings/me
 *
 * Success response (200): Array of booking documents (includes programmeId field)
 * Auth error  (401): { error: "Authentication required" }
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getUserBookings(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Only return the fields the frontend needs — programmeId and paid status.
    const bookings = await Booking.find({ clerkUserId: userId }).select(
      "programmeId paid amount"
    );

    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

module.exports = { createBooking, getUserBookings };
