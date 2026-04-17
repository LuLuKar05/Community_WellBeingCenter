# Lumina — Community Wellbeing Center

A full-stack web application for a community wellbeing center. Members can browse and book wellness programmes, donate, read news, and chat with an AI assistant.

**Live site:** https://community-well-being-center.vercel.app
**API:** https://lumina-backend-api.onrender.com

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), CSS Modules |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas (Mongoose) |
| Auth | Clerk |
| Payments | Stripe |
| AI Chatbot | OpenAI embeddings + FLock/Z.AI completions (RAG) |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Project Structure

```
community_well_being_center/
├── client/          Next.js frontend
│   ├── src/
│   │   ├── app/     Pages (App Router)
│   │   └── components/
│   └── .env.local   Local env overrides (not committed)
├── server/          Express backend
│   ├── config/      MongoDB connection
│   ├── controllers/ Business logic
│   ├── middleware/  Error handling
│   ├── models/      Mongoose schemas
│   ├── routes/      URL → controller wiring
│   └── scripts/     DB seed & AI ingestion
└── vercel.json      Vercel deployment config
```

---

## Navigating the Website

### Home `/`
The landing page. Shows the hero banner, a carousel of upcoming sessions, a short about section, and links to Programmes, News, and the Donate page. The navbar goes transparent over the hero and switches to solid on scroll.

### Programmes `/programmes`
Browse all available wellness sessions. Use the **filter sidebar** on the left to narrow by:
- **Category** — Movement & Yoga, Mental Health, Community Support, Events
- **Day of week** — Monday through Sunday
- **Time of day** — Morning, Afternoon, Evening

Use the **search bar** at the top of the sidebar to search by name.

Toggle between **Grid view** (cards) and **Calendar view** (weekly schedule grid) using the buttons in the top-right of the results area.

Click any programme card to open its detail page.

### Programme Detail `/programmes/[id]`
Full details for a single session — description, day, time, category, and instructor. Signed-in users can **register** for the session. The button shows "Registered" if already booked.

### About `/about`
Information about the center, its mission, and the team.

### News `/news`
Latest articles and announcements from the center. Each card links to the full article.

### Contact `/contactUs`
A contact form to send a message to the center. Includes an FAQ section.

### Donate `/donate`
Supports one-time and monthly donations via **Stripe**. Enter an amount, choose frequency, and complete payment through the Stripe payment element.

### Sign In
Click **Sign In** in the top-right navbar. Clerk handles authentication in a modal — supports email/password and social login. Once signed in, a profile avatar replaces the button.

### AI Chat Widget
The floating chat button (bottom-right corner on every page) opens a chatbot powered by a RAG pipeline. Ask questions about the center's programmes, opening hours, or services. The bot answers only from the center's approved knowledge base.

---

## Local Setup

### Prerequisites

- Node.js >= 18
- npm >= 9
- A MongoDB Atlas cluster
- Clerk account
- Stripe account (test keys are fine)
- OpenAI API key

### 1. Clone

```bash
git clone <repo-url>
cd community_well_being_center
```

### 2. Configure environment variables

**Backend:**
```bash
cp server/.env.example server/.env
# Fill in all values in server/.env
```

**Frontend:**
```bash
cp client/.env.example client/.env.local
# Fill in all values in client/.env.local
```

### 3. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Seed the AI knowledge base (first time only)

```bash
cd server
node scripts/seedProgrammes.js   # seed programme data
node scripts/ingest.js           # build the chatbot knowledge base
```

### 5. Run locally

Open two terminals:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

### Backend — `server/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB Atlas connection string. |
| `CLIENT_URL` | No | Frontend origin for CORS. Defaults to `http://localhost:3000`. Set to your deployed frontend URL in production. |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (`pk_test_...`). |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (`sk_test_...`). |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_test_...` for dev). |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_...`). Get it from `stripe listen` CLI for local testing. |
| `OPENAI_API_KEY` | Yes | OpenAI API key — used to generate embeddings for the chatbot. |
| `FLOCK_API_KEY` | Yes | FLock/Z.AI API key for chat completions. |
| `FLOCK_BASE_URL` | Yes | Z.AI API base URL (e.g. `https://api.flock.io/v1`). |

### Frontend — `client/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL. Use `http://localhost:5000` locally. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (same value as backend). |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Sign-in redirect path. Defaults to `/sign-in`. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Sign-up redirect path. Defaults to `/sign-up`. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (`pk_test_...` for dev). |

---

## Deployment

### Frontend (Vercel)
1. Connect the repo in the Vercel dashboard.
2. Set **Root Directory** to `client`.
3. Add all `client/.env.example` variables as Environment Variables in the Vercel dashboard, using production values.

### Backend (Render)
1. Connect the repo and set the **Root Directory** to `server`.
2. Set **Start Command** to `node server.js`.
3. Add all `server/.env.example` variables in the Render dashboard, using production values. Set `CLIENT_URL` to your Vercel frontend URL.

### Stripe webhooks (production)
Register `https://your-api.onrender.com/api/webhook` as a webhook endpoint in the Stripe dashboard and copy the signing secret to `STRIPE_WEBHOOK_SECRET`.

### MongoDB Atlas Vector Search (one-time setup)
Required for the AI chatbot:
1. Atlas cluster → **Search** tab → Create index.
2. Collection: `knowledge_base`, Index name: `vector_index`.
3. Field: `embedding`, type: `knnVector`, dimensions: `1536`, similarity: `cosine`.
