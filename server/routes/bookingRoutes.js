/**
 * @file bookingRoutes.js
 * @description Express router for the Bookings API.
 *
 * Endpoints:
 *   GET  /api/bookings/me   — list all bookings for the current user
 *   POST /api/bookings      — create a booking for the current user
 *
 * Both routes require a valid Clerk session token in the Authorization header.
 * The token is verified by clerkMiddleware() in server.js.
 *
 * IMPORTANT: /me must be declared BEFORE /:id to prevent Express treating
 * "me" as a dynamic segment value.
 */
const express = require("express");
const router = express.Router();

const { createBooking, getUserBookings } = require("../controllers/bookingController");

// Get all bookings for the authenticated user
router.get("/bookings/me", getUserBookings);

// Create a new booking
router.post("/bookings", createBooking);

module.exports = router;
