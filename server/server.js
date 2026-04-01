require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Stripe = require("stripe");

const Donation = require("./models/Donation");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// --- 1. Middleware ---
// Allow requests from your React frontend
app.use(cors({ origin: "http://localhost:3000" }));

// VERY IMPORTANT: The webhook route must be defined BEFORE express.json()
// because Stripe requires the raw, unparsed body to verify security signatures.
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

// Now we can parse standard JSON bodies for all other routes
app.use(express.json());

// --- 2. Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- 3. The Payment Intent Route ---
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, frequency, firstName, lastName, email } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Convert pounds to pence (£25 -> 2500)
    const amountInPence = amount * 100;

    // Create the PaymentIntent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: "gbp",
      metadata: { frequency, email },
    });

    // Save pending donation to MongoDB
    const newDonation = await Donation.create({
      firstName,
      lastName,
      email,
      amount: amountInPence,
      frequency,
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
    });

    // Send the secret key to React
    res.json({
      clientSecret: paymentIntent.client_secret,
      donationId: newDonation._id,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- 4. The Webhook Handler (Security & Fulfillment) ---
async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify the event actually came from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event when payment is successful
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // Find the pending donation in our database and mark it as 'succeeded'
    await Donation.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: "succeeded" },
    );

    console.log(
      `✅ Payment for ${paymentIntent.amount} pence succeeded! Database updated.`,
    );
    // TODO: Trigger a "Thank You" email here in the future
  }

  // Tell Stripe we received the webhook successfully
  res.json({ received: true });
}

// --- 5. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
