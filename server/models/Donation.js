/**
 * @file Donation.js
 * @description Mongoose schema and model for donation records.
 *
 * Each document in the "donations" MongoDB collection represents one
 * donation attempt. A donation begins life with status "pending" when the
 * user submits the form, and is updated to "succeeded" (or "failed") when
 * Stripe sends a webhook confirming the payment outcome.
 *
 * The stripePaymentIntentId field is the link between our database record
 * and the Stripe dashboard — it allows the webhook handler to find and
 * update the correct Donation when a payment event arrives.
 */
const mongoose = require("mongoose");

/**
 * @typedef {Object} DonationDocument
 * @property {string}  [firstName]            - Donor's first name (optional for anonymous donations)
 * @property {string}  [lastName]             - Donor's last name (optional for anonymous donations)
 * @property {string}  email                  - Donor's email address (required for tax receipts)
 * @property {boolean} isAnonymous            - Whether the donor chose to be anonymous (default: false)
 * @property {number}  amount                 - Donation amount in pence (e.g. £25 = 2500)
 * @property {string}  currency               - ISO currency code (default: "gbp")
 * @property {string}  frequency              - "one-time" or "monthly"
 * @property {string}  status                 - "pending" | "succeeded" | "failed"
 * @property {string}  [stripePaymentIntentId] - Stripe PaymentIntent ID for webhook matching
 * @property {Date}    createdAt              - Auto-set by Mongoose timestamps
 * @property {Date}    updatedAt              - Auto-set by Mongoose timestamps
 */
const DonationSchema = new mongoose.Schema(
  {
    // First and last name are optional because donors may choose to give anonymously.
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },

    // Email is required — it is used for sending tax receipts and thank-you messages.
    email: { type: String, required: true },

    // Flag that indicates the donor opted for an anonymous donation.
    // When true, the frontend should not display the donor's name publicly.
    isAnonymous: { type: Boolean, default: false },

    // Stored in the smallest currency unit (pence for GBP) to match Stripe's format.
    // Example: £25 donation is stored as 2500.
    amount: { type: Number, required: true },

    // Currency code follows the ISO 4217 standard. Defaults to GBP.
    currency: { type: String, default: "gbp" },

    // Controls whether this is a single charge or a recurring subscription.
    // Note: "monthly" currently creates a one-off PaymentIntent — true recurring
    // billing would require migrating to Stripe Subscriptions in a future sprint.
    frequency: { type: String, enum: ["one-time", "monthly"], required: true },

    // Tracks where the donation is in the payment lifecycle:
    //   pending   → PaymentIntent created, waiting for payment confirmation
    //   succeeded → Stripe webhook confirmed the charge went through
    //   failed    → Payment was declined or cancelled
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },

    // The Stripe PaymentIntent ID (e.g. "pi_3N..."). Used by the webhook handler
    // to find this exact record when Stripe sends a payment confirmation.
    stripePaymentIntentId: { type: String },
  },
  // timestamps: true automatically adds and manages createdAt and updatedAt fields.
  { timestamps: true }
);

module.exports = mongoose.model("Donation", DonationSchema);
