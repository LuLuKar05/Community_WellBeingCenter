/**
 * @file seedProgrammes.js
 * @description One-time seed script that populates the programmes collection.
 *
 * Run this script whenever you want to reset the programmes data:
 *
 *   HOW TO RUN (from the server/ directory):
 *     node scripts/seedProgrammes.js
 *
 * WHAT IT DOES:
 *   1. Connects to MongoDB using MONGO_URI from server/.env
 *   2. Deletes all existing Programme documents
 *   3. Inserts the PROGRAMMES array below as new documents
 *   4. Logs results and exits
 *
 * REQUIREMENTS:
 *   - MONGO_URI must be set in server/.env
 */
const path = require("path");
// Resolve .env relative to __dirname so the script works regardless of
// which directory it is invoked from (same fix applied in ingest.js).
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const Programme = require("../models/Programme");

/**
 * Seed data for the Community Wellbeing Center programmes directory.
 * Covers all four categories and a spread of days and time slots.
 */
const PROGRAMMES = [
  // ── Movement & Yoga ──────────────────────────────────────────────────────────
  {
    title: "Sunrise Vinyasa Flow",
    description:
      "A gentle, awakening practice focusing on breath and fluid movement. Suitable for all levels — no prior yoga experience needed.",
    category: "Movement & Yoga",
    day: "Tuesday",
    time: "Morning",
    timeStr: "8:00 AM",
    instructor: "Aisha Rahman",
    capacity: 18,
    price: 5,
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400",
  },
  {
    title: "Hatha for Beginners",
    description:
      "Slow-paced foundational poses with alignment cues. Perfect if you have never tried yoga or are returning after a break.",
    category: "Movement & Yoga",
    day: "Thursday",
    time: "Morning",
    timeStr: "9:30 AM",
    instructor: "Aisha Rahman",
    capacity: 15,
    price: 5,
    image:
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=400",
  },
  {
    title: "Restorative Yin",
    description:
      "Long-held passive stretches targeting connective tissue. Ideal for stress recovery, improved flexibility, and deep relaxation.",
    category: "Movement & Yoga",
    day: "Friday",
    time: "Evening",
    timeStr: "6:30 PM",
    instructor: "Marcus Webb",
    capacity: 16,
    price: 5,
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400",
  },

  // ── Mental Health ─────────────────────────────────────────────────────────────
  {
    title: "Guided Vipassana",
    description:
      "Practical tools to manage anxiety and improve focus through insight meditation. Facilitated by a certified mindfulness instructor.",
    category: "Mental Health",
    day: "Wednesday",
    time: "Evening",
    timeStr: "6:00 PM",
    instructor: "Dr. Priya Nair",
    capacity: 20,
    price: 0,
    image:
      "https://images.unsplash.com/photo-1593113562332-9b2f6bb2d352?q=80&w=400",
  },
  {
    title: "Anxiety & Stress Workshop",
    description:
      "A hands-on workshop introducing CBT-based techniques for managing everyday anxiety. Includes workbook and follow-up resources.",
    category: "Mental Health",
    day: "Monday",
    time: "Afternoon",
    timeStr: "2:00 PM",
    instructor: "Dr. Priya Nair",
    capacity: 12,
    price: 15,
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400",
  },
  {
    title: "Mindfulness Foundations",
    description:
      "A four-week introduction to mindfulness-based stress reduction (MBSR). Learn to observe thoughts without judgement and build a daily practice.",
    category: "Mental Health",
    day: "Thursday",
    time: "Evening",
    timeStr: "7:00 PM",
    instructor: "Sam Okafor",
    capacity: 14,
    price: 10,
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400",
  },

  // ── Community Support ─────────────────────────────────────────────────────────
  {
    title: "Peer Support Circle",
    description:
      "A safe, facilitated space to share experiences and listen to others. No agenda — just connection and mutual understanding.",
    category: "Community Support",
    day: "Tuesday",
    time: "Evening",
    timeStr: "6:30 PM",
    instructor: "Community Facilitator",
    capacity: 20,
    price: 0,
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400",
  },
  {
    title: "Family Drop-In",
    description:
      "An informal morning session for parents, carers, and children to connect, play, and access wellbeing support in a relaxed environment.",
    category: "Community Support",
    day: "Wednesday",
    time: "Morning",
    timeStr: "10:00 AM",
    instructor: "Community Facilitator",
    capacity: 30,
    price: 0,
    image:
      "https://images.unsplash.com/photo-1484863137850-59afcfe05386?q=80&w=400",
  },

  // ── Events ────────────────────────────────────────────────────────────────────
  {
    title: "Community Wellbeing Fair",
    description:
      "An open day showcasing local health services, taster sessions, live music, and healthy food. All welcome — bring the whole family.",
    category: "Events",
    day: "Saturday",
    time: "Morning",
    timeStr: "10:00 AM",
    instructor: "Centre Team",
    capacity: 200,
    price: 0,
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=400",
  },
  {
    title: "Guest Speaker: Living Well with Chronic Pain",
    description:
      "An evening talk by Dr. Helen Carter on evidence-based strategies for managing chronic pain and improving daily quality of life.",
    category: "Events",
    day: "Friday",
    time: "Evening",
    timeStr: "7:30 PM",
    instructor: "Dr. Helen Carter",
    capacity: 60,
    price: 0,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400",
  },
];

/**
 * Connects to MongoDB, clears the programmes collection, and inserts seed data.
 * @async
 */
async function seedProgrammes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Wipe existing documents so re-running the script is idempotent.
    await Programme.deleteMany({});
    console.log("Cleared existing programmes");

    const inserted = await Programme.insertMany(PROGRAMMES);
    console.log(`Seeded ${inserted.length} programmes successfully.`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedProgrammes();
