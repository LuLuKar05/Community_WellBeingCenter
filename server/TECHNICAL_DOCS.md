# Community Wellbeing Center — Backend Technical Documentation

**Last updated:** April 2026
**Runtime:** Node.js >= 18
**Framework:** Express 4.x
**Database:** MongoDB Atlas (Mongoose 9.x, Vector Search required)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Environment Variables](#3-environment-variables)
4. [API Endpoints](#4-api-endpoints)
5. [Database Models](#5-database-models)
6. [AI Chatbot: RAG Pipeline](#6-ai-chatbot-rag-pipeline)
7. [Payment Flow (Stripe)](#7-payment-flow-stripe)
8. [Running Locally](#8-running-locally)
9. [Running the Ingestion Script](#9-running-the-ingestion-script)
10. [Known Limitations & Future Work](#10-known-limitations--future-work)

---

## 1. Architecture Overview

The backend follows a three-layer MVC-style architecture where each layer has a single, well-defined responsibility:

```
HTTP Request
     │
     ▼
┌──────────────┐
│    Routes    │  Declares URL patterns and HTTP methods.
│  /routes/    │  Zero business logic — only wires URLs to controllers.
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Controllers  │  All business logic: validation, external API calls,
│ /controllers/│  database queries. Calls next(error) on failure.
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Models    │  Mongoose schemas. Define data shape and collection name.
│  /models/    │  No logic — only structure and type constraints.
└──────────────┘
```

**External services:**

| Service | Purpose |
|---------|---------|
| Stripe | Payment processing — PaymentIntents and webhooks |
| OpenAI (text-embedding-3-small) | Converts text to vector embeddings for the chatbot |
| FLock / Z.AI | LLM chat completions for chatbot responses |
| MongoDB Atlas | Hosted MongoDB with Vector Search for RAG retrieval |

---

## 2. Project Structure

```
server/
├── server.js                    Entry point. DB connect, middleware, routes, listen.
├── config/
│   └── db.js                    MongoDB connection. Exits process on failure.
├── routes/
│   ├── paymentRoutes.js         POST /api/webhook, POST /api/create-payment-intent
│   └── chatRoutes.js            POST /api/chat
├── controllers/
│   ├── paymentController.js     Stripe PaymentIntent creation + webhook fulfillment.
│   └── chatController.js        RAG pipeline: embed → vector search → generate.
├── models/
│   ├── Donation.js              Schema for donation records.
│   └── Knowledge.js             Schema for RAG knowledge base entries.
├── middleware/
│   └── errorHandler.js          Centralized 4-param error handler.
├── scripts/
│   └── ingest.js                One-time script to seed the knowledge base.
├── package.json                 Backend dependencies and npm scripts.
├── .env                         Environment variables (never commit this file).
└── TECHNICAL_DOCS.md            This file.
```

---

## 3. Environment Variables

All secrets and configuration live in `server/.env`. This file must **never** be committed to version control. Use `.env.example` or this table to onboard new developers.

| Variable               | Required | Description |
|------------------------|----------|-------------|
| `PORT`                 | No       | HTTP server port. Defaults to `5000`. |
| `MONGO_URI`            | Yes      | MongoDB Atlas connection string. |
| `STRIPE_SECRET_KEY`    | Yes      | Stripe secret key (`sk_test_...` or `sk_live_...`). |
| `STRIPE_WEBHOOK_SECRET`| Yes      | Stripe webhook signing secret (`whsec_...`). |
| `OPENAI_API_KEY`       | Yes      | OpenAI API key for text-embedding-3-small. |
| `FLOCK_API_KEY`        | Yes      | FLock/Z.AI API key for chat completions. |
| `FLOCK_BASE_URL`       | Yes      | Base URL for the Z.AI API endpoint. Must be the real URL — the original code had a placeholder. |
| `CLIENT_URL`           | No       | Frontend origin allowed by CORS. Defaults to `http://localhost:3000`. Change to the deployed frontend URL in production. |

---

## 4. API Endpoints

### POST `/api/create-payment-intent`

Creates a Stripe PaymentIntent and saves a pending Donation record.

**Request body:**
```json
{
  "amount": 25,
  "frequency": "monthly",
  "email": "donor@example.com",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Validation rules:**
- `amount` — required, must be a number >= 1 (in pounds, not pence)
- `email` — required, must match basic email format
- `frequency` — required, must be `"one-time"` or `"monthly"`
- `firstName`, `lastName` — optional (anonymous donations are supported)

**Success response `200`:**
```json
{
  "clientSecret": "pi_3N..._secret_...",
  "donationId": "64abc123..."
}
```

**Error responses:**
- `400` — validation failed (returns `{ "error": "..." }` describing the issue)
- `500` — Stripe API error or database error

---

### POST `/api/webhook`

Receives signed webhook events from Stripe. This route uses `express.raw()` (not `express.json()`) to receive the raw body bytes needed to verify Stripe's cryptographic signature.

**Headers:** `stripe-signature` — set automatically by Stripe; do not set manually.

**Handled events:**

| Event Type | Action |
|------------|--------|
| `payment_intent.succeeded` | Finds the matching Donation by `stripePaymentIntentId` and sets `status` to `"succeeded"` |

**Success response:** `{ "received": true }`

**Error response:** `400` with a text body if signature verification fails.

> **Security note:** Requests with invalid signatures are rejected immediately. This prevents attackers from sending fake payment confirmations.

---

### POST `/api/chat`

Accepts a user message and returns an AI-generated reply using the RAG pipeline.

**Request body:**
```json
{ "message": "What time do you close on Saturdays?" }
```

**Validation:** `message` must be a non-empty string.

**Success response `200`:**
```json
{ "reply": "We are open on Saturdays from 9:00 AM to 5:00 PM." }
```

**Error responses:**
- `400` — missing or empty message
- `500` — OpenAI embedding error, MongoDB vector search error, or FLock generation error

---

## 5. Database Models

### Donation

MongoDB collection: `donations`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `firstName` | String | No | Omitted for anonymous donations |
| `lastName` | String | No | Omitted for anonymous donations |
| `email` | String | Yes | Used for tax receipts and thank-you emails |
| `isAnonymous` | Boolean | No | Default: `false` |
| `amount` | Number | Yes | Stored in **pence** (£25 → 2500) to match Stripe |
| `currency` | String | No | Default: `"gbp"` |
| `frequency` | String | Yes | Enum: `"one-time"` or `"monthly"` |
| `status` | String | No | Enum: `"pending"` → `"succeeded"` or `"failed"` |
| `stripePaymentIntentId` | String | No | Links this record to a Stripe PaymentIntent for webhook matching |
| `createdAt` | Date | Auto | Managed by Mongoose `timestamps: true` |
| `updatedAt` | Date | Auto | Managed by Mongoose `timestamps: true` |

### Knowledge

MongoDB collection: `knowledge_base` (explicitly set — Mongoose would default to `"knowledges"` which would break the Atlas Vector Search index)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `text` | String | Yes | The original human-readable text chunk |
| `embedding` | `[Number]` | Yes | 1536-dimensional vector from `text-embedding-3-small` |
| `createdAt` | Date | Auto | Managed by Mongoose `timestamps: true` |

---

## 6. AI Chatbot: RAG Pipeline

RAG (Retrieval-Augmented Generation) grounds the AI's answers in pre-approved content. Without it, the model could hallucinate incorrect opening hours, prices, or services.

```
User message: "What time does the yoga class start?"
                         │
                         ▼
            ┌────────────────────────┐
            │     STEP 1: EMBED      │
            │                        │
            │  OpenAI converts the   │
            │  question into a vector│
            │  of 1536 numbers using │
            │  text-embedding-3-small│
            └──────────┬─────────────┘
                       │  questionVector = [0.02, -0.14, 0.91, ...]
                       ▼
            ┌────────────────────────┐
            │    STEP 2: RETRIEVE    │
            │                        │
            │  MongoDB Atlas Vector  │
            │  Search compares the   │
            │  questionVector against│
            │  all stored embeddings │
            │  Returns top 3 matches │
            └──────────┬─────────────┘
                       │  "Morning Flow Yoga is held Tuesday & Thursday at 10AM..."
                       ▼
            ┌────────────────────────┐
            │    STEP 3: GENERATE    │
            │                        │
            │  FLock/Z.AI receives:  │
            │  • System prompt with  │
            │    the 3 context chunks│
            │  • The user's question │
            │                        │
            │  Returns a grounded    │
            │  natural language reply│
            └──────────┬─────────────┘
                       │
                       ▼
Reply: "Morning Flow Yoga is on Tuesdays and Thursdays at 10:00 AM in the Main Hall."
```

**Key constraint:** The system prompt instructs the model to answer **only** from the retrieved context. If the answer is not in the knowledge base, the chatbot says so rather than guessing.

**Updating the knowledge base:** Edit `centerData` in `scripts/ingest.js` and re-run the script. The script clears and rebuilds the collection on every run.

---

## 7. Payment Flow (Stripe)

The payment flow uses Stripe's two-step pattern: create intent → confirm via webhook.

```
Frontend (React / Next.js)          Backend (Express)               Stripe
──────────────────────────          ─────────────────               ──────

User fills in donation form
         │
         │  POST /api/create-payment-intent
         │  { amount, email, frequency, ... }
         │ ──────────────────────────────────────────────────────────►
         │                                              Creates PaymentIntent
         │                             ◄──────────────────────────────
         │                             Saves "pending" Donation to MongoDB
         │  ◄──────────────────────────
         │  { clientSecret, donationId }
         │
Stripe.js renders
the payment form
         │
User enters card details
and clicks "Donate"
         │ ──────────────────────────────────────────────────────────►
         │                                              Charges the card
         │  ◄────────────────────────────────────────────────────────
         │  Payment result (success/fail shown to user)
                                                        │
                                                        │  Webhook: payment_intent.succeeded
                                                        │ ─────────────────────────────────►
                                                        │          Verifies Stripe signature
                                                        │          Updates Donation.status
                                                        │          = "succeeded" in MongoDB
```

> **Important:** The webhook confirmation is the authoritative record. Frontend success messages are provisional — the database status is only trusted after the webhook updates it.

---

## 8. Running Locally

```bash
# From the server/ directory
npm install

# Ensure all variables in .env are populated (see Section 3)
# Then start with hot-reload (uses node --watch):
npm run dev

# Or start in production mode:
npm start
```

The server listens on `http://localhost:5000` by default.

**Testing Stripe webhooks locally:**

Stripe cannot reach `localhost` directly. Use the Stripe CLI to forward events:

```bash
stripe listen --forward-to localhost:5000/api/webhook
```

The CLI will print a webhook signing secret — paste it into `.env` as `STRIPE_WEBHOOK_SECRET`. Trigger a test event with:

```bash
stripe trigger payment_intent.succeeded
```

---

## 9. Running the Ingestion Script

The ingestion script seeds the AI knowledge base. Run it once on setup and again whenever the center's information changes.

```bash
# From the server/ directory
node scripts/ingest.js
```

**What it does:**
1. Connects to MongoDB Atlas
2. Deletes all existing `knowledge_base` documents
3. For each string in `centerData`, generates a vector embedding via OpenAI
4. Saves the text + embedding pair to MongoDB

**After running:** Verify in MongoDB Atlas that the `knowledge_base` collection is populated with documents that have an `embedding` array of 1536 numbers.

**MongoDB Atlas Vector Search index setup** (one-time, manual):
1. Open your Atlas cluster → **Search** tab
2. Create an index on the `knowledge_base` collection
3. Index name: `vector_index`
4. Field: `embedding`, type: `knnVector`, dimensions: `1536`, similarity: `cosine`

This index must exist before the chatbot can perform vector searches.

---

## 10. Known Limitations & Future Work

| Item | Priority | Notes |
|------|----------|-------|
| `FLOCK_BASE_URL` is a placeholder | High | Must be replaced with the real Z.AI endpoint. Contact the project lead. |
| No "Thank You" email on donation | Medium | TODO comment in `paymentController.js` — integrate a service like SendGrid when ready. |
| Duplicate email input in `DonationFlow.jsx` | Medium | Client-side bug: two `<input type="email">` fields exist simultaneously (line 140 overwrites line 136). Fix is to remove the second input in the frontend component. |
| No rate limiting on `/api/chat` | Medium | Could be abused by bots. Add `express-rate-limit` middleware in a future sprint. |
| `payment_intent.payment_failed` not handled | Low | The webhook handler only processes `payment_intent.succeeded`. Add a `payment_failed` case to mark Donations as `"failed"` so the dashboard data is accurate. |
| "Monthly" donations are not truly recurring | Low | The current Stripe integration creates a one-off PaymentIntent for both frequencies. True recurring billing requires migrating to Stripe Subscriptions. |
| CORS CLIENT_URL defaults to localhost | Low | Controlled via `CLIENT_URL` env variable — update to the production frontend URL before deploying. |
