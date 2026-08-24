# CalmCampus AI

**Your calm space for exam season.**

A lightweight AI-powered web application for college students experiencing academic pressure and exam
stress — private AI chat support, mood tracking with streaks, a study planner, a Pomodoro focus timer, and
a genuine "Unwind Zone" with breathing exercises and calm mini-games.

This is a student wellness and academic-support application, **not** a medical diagnosis or professional
mental-health treatment application.

## Academic Assignment

- **Idea:** CalmCampus AI — Personalized AI Support for Exam Stress
- **Web Security Technique:** Cross-Site Scripting (XSS) Prevention

Rather than a separate "Security Center" page, protection is woven into the product itself and explained
where it's relevant: the **Privacy page** (`/privacy`) has a "How your content is protected" section with a
live, interactive demo you can run yourself. See [`SECURITY.md`](./SECURITY.md) for the full technical
write-up.

## Features

- **Private AI chat assistant** — genuinely answers whatever a student asks (study questions, exam
  strategy, or just talking through stress), backed by the real Claude API. Add your own `AI_API_KEY` and
  it's a real conversation, not a script. Without a key, a dynamic offline fallback still answers common
  study questions (memorization, time management, focus, sleep, procrastination) with varied, non-repeating
  responses so the app works immediately.
- **Flashcards** — create subject decks and cards, then review them with a simple Leitner-style spaced
  repetition system: cards you know move up a box and appear less often; cards you miss come right back.
- **Mood check-ins with streaks & calm points** — a lightweight, honest gamification layer built from your
  real check-in history (no fake numbers)
- **Study planner** — subjects, exam dates, priority, and progress, with a multi-exam countdown strip and
  tasks feeding directly into the focus timer
- **Focus Timer (Pomodoro)** — 25/5/15-minute sessions, optionally tied to a specific study task, with a
  daily session counter
- **Unwind Zone** — a breathing exercise plus two genuinely relaxing mini-games (Bubble Pop, Memory Match)
  for a real break between study sessions, not just another feature to click through
- **Student resources** — short, practical reading on study technique, time management, and rest
- **Secure authentication** — bcrypt password hashing, httpOnly session cookies
- **XSS protection**, demonstrated live from the Privacy page, applied to every real input field in the app
- Fully responsive (mobile, tablet, laptop, desktop)

### Why these features and not others

Everything above earns its place by solving something students actually run into during exam season:
staying focused, retaining material, taking a real break, tracking mood honestly, and organizing a
workload that feels too big. A standalone "Security Center" page was intentionally removed — the security
work still exists (and is still demonstrable for a viva) but lives inside the Privacy page instead of
competing for attention with the features students actually open every day.

## Technology stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide icons, React Router
**Backend:** Node.js, Express, TypeScript
**Database:** SQLite by default via Prisma ORM (swap to PostgreSQL by changing `provider` + `DATABASE_URL`
in `backend/prisma/schema.prisma`)
**Security:** `sanitize-html` for XSS sanitization, Zod for validation, Helmet for security headers, bcrypt
for password hashing, JWT session cookies

## Project architecture

```
calmcampus/
├── backend/
│   └── src/
│       ├── routes/        # auth, user, conversations, moods, tasks, security (xss-test endpoint)
│       ├── middleware/     # auth, validation, error handling
│       ├── services/       # AI service abstraction (mock/real provider)
│       ├── validators/     # Zod schemas
│       ├── utils/          # XSS sanitization utilities
│       └── prisma/         # schema.prisma
└── frontend/
    └── src/
        ├── pages/           # Landing, Login, Register, Onboarding, Today, Chat, Mood,
        │                    # Planner, Focus, Unwind, Resources, Profile, Privacy
        ├── components/
        │   ├── ui/          # Button, Card, Input, ProgressRing, Badge, AuroraBackground…
        │   ├── layout/      # Navbar, Footer, AppShell (sidebar + mobile nav)
        │   ├── games/       # BubblePop, MemoryMatch
        │   └── security/    # XSSDemo widget (embedded in the Privacy page)
        ├── context/         # AuthContext
        ├── services/        # API client
        └── types/
```

## Installation

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit SESSION_SECRET etc. if needed
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev                # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL should point at the backend
npm install
npm run dev                 # http://localhost:5173
```

Open `http://localhost:5173` — the app runs fully with the built-in mock AI provider, no external API key
needed.

## Environment variables

**backend/.env**

| Variable | Purpose |
|---|---|
| `PORT` | Backend port (default 4000) |
| `FRONTEND_URL` | Allowed CORS origin |
| `SESSION_SECRET` | JWT signing secret — set a long random string |
| `DATABASE_URL` | Prisma connection string (SQLite file by default) |
| `AI_API_KEY` / `AI_MODEL` | Set `AI_API_KEY` to your Anthropic API key to enable real AI Support responses. `AI_MODEL` defaults to `claude-sonnet-4-5`. Leave `AI_API_KEY` blank to use the offline fallback. |

**frontend/.env**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## AI Support

`backend/src/services/aiService.ts` calls the real Claude API (`@anthropic-ai/sdk`) whenever `AI_API_KEY`
is set — the assistant can then genuinely answer whatever a student asks, not just match keywords. Get a
key from https://console.anthropic.com, put it in `backend/.env`, and restart the backend.

Without a key, `OfflineFallbackProvider` still gives useful, topic-aware answers (memorization, time
management, focus, sleep, procrastination) with multiple worded variants and no-repeat logic, so the app is
usable out of the box — but a real key is what makes it feel like an actual assistant.

## Database setup

Prisma models: `User`, `Conversation`, `Message`, `MoodEntry`, `StudyTask`, `FlashcardDeck`, `Flashcard`
(see `backend/prisma/schema.prisma`). Run migrations with `npx prisma migrate dev`. To switch to
PostgreSQL, change the `datasource` provider to `postgresql` and point `DATABASE_URL` at your Postgres
instance, then re-run `migrate dev`.

Focus Timer session counts are lightweight and stored per-browser (no schema needed for that); everything
else — moods, tasks, conversations — is persisted through the database as usual.

## Security implementation

The application's primary security control is **XSS prevention**, implemented in layers:
validation → sanitization → safe rendering → security headers. Full detail in
[`SECURITY.md`](./SECURITY.md). Try it live at **Privacy → "How your content is protected" → See it in
action**.

## Testing

```bash
cd backend
npm test
```

Covers: XSS payload neutralization, registration/login, weak-password rejection, protected-route
authorization, and basic input validation.

## Demo data

On first run the app has no data — sign up, complete onboarding, and add your own mood check-ins and study
tasks. There is no fake/hardcoded "analytics" after authentication; every number on the dashboard (calm
score, streak, calm points, study progress) is computed from your actual entries.

## Future improvements

- Real AI provider integration (swap `RealProviderPlaceholder` in `backend/src/services/aiService.ts`)
- Persist Focus Timer sessions server-side for cross-device history
- Rich Markdown rendering for AI responses (via the existing `sanitizeRichText` allowlist)
- Password reset flow
- Google OAuth (not implemented — no credentials configured, per the assignment brief)
- Postgres deployment config
