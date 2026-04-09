/**
 * @file paymentRoutes.js
 * @description Express Router for all Stripe payment-related endpoints.
 *
 * CRITICAL ORDERING NOTE — WHY express.raw() IS USED HERE:
 *
 * The webhook route MUST receive the raw, unparsed request body. Stripe
 * cryptographically signs each webhook payload using STRIPE_WEBHOOK_SECRET.
 * The signature is computed over the exact bytes of the original body.
 * If express.json() runs first, it parses the Buffer into a JavaScript
 * object and re-serialises it — this mutates the bytes, making the
 * signature check fail with a 400 error on every legitimate webhook.
 *
 * Solution: apply express.raw({ type: "application/json" }) only to the
 * /webhook route, and mount this router in server.js BEFORE the global
 * express.json() middleware.
 */
const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  handleWebhook,
} = require("../controllers/paymentController");

/**
 * POST /api/webhook
 *
 * Receives signed webhook events from Stripe (e.g. payment_intent.succeeded).
 * express.raw() preserves the raw Buffer body required for signature verification.
 * This route must be registered BEFORE express.json() is applied globally.
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Keep body as raw Buffer for Stripe
  handleWebhook
);

/**
 * POST /api/create-payment-intent
 *
 * Creates a Stripe PaymentIntent and a pending Donation record in MongoDB.
 * Returns a clientSecret for the Stripe.js frontend SDK to render the
 * payment form and collect card details.
 *
 * Request body: { amount, frequency, email, firstName?, lastName? }
 */
/**
 * express.json() is applied at the route level here because paymentRoutes is
 * mounted in server.js BEFORE the global express.json() middleware (that
 * ordering is required to keep the webhook body unparsed). Without this,
 * req.body would be undefined and destructuring amount/email/etc would crash.
 */
router.post("/create-payment-intent", express.json(), createPaymentIntent);

module.exports = router;
