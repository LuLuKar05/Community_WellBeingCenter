// backend/models/Donation.js
const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema(
  {
    // Name is no longer required
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: true }, // Keep required for tax receipts
    isAnonymous: { type: Boolean, default: false }, // NEW FLAG
    amount: { type: Number, required: true },
    currency: { type: String, default: "gbp" },
    frequency: { type: String, enum: ["one-time", "monthly"], required: true },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Donation", DonationSchema);
