/**
 * @file paymentController.js
 * @description Business logic for all Stripe payment operations.
 *
 * This file has two responsibilities:
 *
 * 1. PAYMENT INTENT CREATION — When a user decides to donate, the frontend
 *    calls createPaymentIntent. We create a Stripe PaymentIntent (which
 *    returns a clientSecret) and save a "pending" Donation to MongoDB.
 *    The clientSecret is returned to React so Stripe.js can render the
 *    payment form and collect card details directly on Stripe's servers.
 *
 * 2. WEBHOOK FULFILLMENT — After the user's card is charged, Stripe sends
 *    a signed HTTP request (webhook) to handleWebhook. We verify the
 *    signature, then update the Donation status from "pending" to "succeeded".
 *    This server-to-server confirmation is the authoritative source of truth
 *    for whether a payment actually succeeded — the frontend result alone is
 *    not trustworthy because it can be manipulated by the user.
 */
const Stripe = require("stripe");
const Donation = require("../models/Donation");

// Initialise the Stripe client with the secret key from environment variables.
// This key must NEVER be sent to or exposed on the frontend.
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ─── Validation Helpers ───────────────────────────────────────────────────────

/**
 * Checks whether a string looks like a valid email address.
 * Uses a basic regex suitable for server-side sanity checking.
 * The browser's <input type="email"> handles more thorough validation
 * on the client side before the request even reaches us.
 *
 * @param {string} email
 * @returns {boolean} true if the email format is plausible
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Checks whether a frequency value is one of the two accepted options.
 * This mirrors the enum constraint in the Donation Mongoose model to
 * prevent invalid data from reaching the database.
 *
 * @param {string} frequency
 * @returns {boolean} true if frequency is "one-time" or "monthly"
 */
function isValidFrequency(frequency) {
  return ["one-time", "monthly"].includes(frequency);
}

// ─── Controller Functions ─────────────────────────────────────────────────────

/**
 * Creates a Stripe PaymentIntent and saves a pending Donation record.
 *
 * Route: POST /api/create-payment-intent
 *
 * Expected request body:
 * @param {Object}  req.body
 * @param {number}  req.body.amount    - Donation amount in pounds (e.g. 25 for £25)
 * @param {string}  req.body.frequency - "one-time" or "monthly"
 * @param {string}  req.body.email     - Donor's email (required for receipts)
 * @param {string}  [req.body.firstName] - Optional (anonymous donations supported)
 * @param {string}  [req.body.lastName]  - Optional
 *
 * Success response (200):
 * @returns {{ clientSecret: string, donationId: string }}
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function createPaymentIntent(req, res, next) {
  try {
    const { amount, frequency, firstName, lastName, email } = req.body;

    // --- Input Validation ---
    // Reject early with a clear 400 message rather than letting invalid data
    // reach Stripe or the database and produce a confusing error.
    if (!amount || typeof amount !== "number" || amount < 1) {
      return res
        .status(400)
        .json({ error: "Invalid amount. Must be a number of at least 1." });
    }
    if (!email || !isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: "A valid email address is required." });
    }
    if (!frequency || !isValidFrequency(frequency)) {
      return res
        .status(400)
        .json({ error: 'Frequency must be "one-time" or "monthly".' });
    }

    // Convert pounds to pence for Stripe (e.g. £25 → 2500).
    // Stripe always works in the smallest currency unit (pence for GBP).
    const amountInPence = Math.round(amount * 100);

    // Create a Stripe PaymentIntent. This reserves the payment on Stripe's
    // side and returns a clientSecret that the React frontend needs to
    // render the Stripe payment form.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: "gbp",
      // metadata is stored on the Stripe dashboard for reconciliation
      metadata: { frequency, email },
    });

    // Save a "pending" Donation record to our database.
    // The status remains "pending" until the Stripe webhook confirms payment.
    const newDonation = await Donation.create({
      firstName: firstName || undefined, // store undefined so Mongoose omits the field
      lastName: lastName || undefined,
      email,
      amount: amountInPence,
      frequency,
      status: "pending",
      // Store the Stripe PaymentIntent ID so we can match it in the webhook
      stripePaymentIntentId: paymentIntent.id,
    });

    // Return the clientSecret to the frontend. It does NOT contain sensitive
    // data — Stripe uses it only to identify this specific payment.
    res.json({
      clientSecret: paymentIntent.client_secret,
      donationId: newDonation._id,
    });
  } catch (error) {
    // Hand off to the centralized error handler in middleware/errorHandler.js
    next(error);
  }
}

/**
 * Handles incoming Stripe webhook events.
 *
 * Route: POST /api/webhook
 *
 * SECURITY: This route receives a raw (unparsed) request body. Stripe
 * cryptographically signs every webhook payload with STRIPE_WEBHOOK_SECRET.
 * We verify that signature here — if it's invalid, we reject the request
 * immediately. This prevents attackers from sending fake payment confirmations
 * to mark donations as "succeeded" without actually paying.
 *
 * IMPORTANT: The webhook route must use express.raw() (not express.json()).
 * express.json() parses and re-serialises the body, which changes it and
 * breaks the signature. See routes/paymentRoutes.js for the middleware setup.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function handleWebhook(req, res, next) {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // constructEvent will throw a SignatureVerificationError if the signature
    // does not match, protecting against tampered or forged webhook payloads.
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    // Return 400 directly — this is a deliberate security rejection, not an
    // unexpected runtime error, so we bypass the generic error handler.
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Route to the correct handler based on Stripe's event type.
  // Additional event types (e.g. payment_intent.payment_failed) can be
  // added here as case branches when needed.
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // Find the matching "pending" Donation by its Stripe PaymentIntent ID
    // and mark it as "succeeded" — this is the authoritative confirmation.
    await Donation.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: "succeeded" }
    );

    console.log(
      `Payment of ${paymentIntent.amount} pence succeeded. Donation updated to "succeeded".`
    );

    // TODO: Send a "Thank You" email to the donor here using a service
    // like SendGrid. The donor's email is stored on the Donation record.
  }

  // Stripe requires a 200 response to confirm the webhook was received.
  // If we don't respond promptly, Stripe will retry the webhook multiple times.
  res.json({ received: true });
}

module.exports = { createPaymentIntent, handleWebhook };
