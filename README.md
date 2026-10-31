# AlgoForge ⚡

A highly optimized, full-stack Data Structures and Algorithms (DSA) preparation platform designed to help software engineers track their interview prep progress.

> **Architecture Deep-Dive:** Want to see how the system is engineered? Read the [ARCHITECTURE.md](./ARCHITECTURE.md) for a breakdown of the layered design, caching strategy, and security pipeline.

---

## 🎯 Key Features

### AI Sheet Copilot & Curriculum Generator
- **Natural Language Sheet Agent:** Generate, reorder, or prune problem sheets from job descriptions, company targets (e.g., "Google L4 Interview Prep"), or custom constraints (e.g., "Top 75 DP questions") via Gemini 2.5 function calling with automatic heuristic fallback.
- **Interactive Action Diff (Human-in-the-Loop):** Review proposed additions, deletions of already-solved problems, and reorderings with visual diff cards and toggle checkboxes before committing.
- **Flexible Commit Targets:** Append to active workspace, create a standalone sheet, or atomically replace curriculum in a single Prisma transaction.
- **CSV & JSON Importer:** Import problem sheets via drag-and-drop or paste with RFC 4180 parsing (handles quoted strings, commas, newlines) and preview verification.

### AI Study Coach & Token Guard
- **Tactical Recommendations:** Dynamic daily guidance evaluating recent velocity, weak topics, and upcoming contests.
- **Token Guard & Cooldown:** 24-hour daily cache in Redis (`ai_coach_plan:${userId}`) with a 1-hour locked cooldown key (`ai_coach_cooldown:${userId}`) on manual refresh, paired with a live countdown timer badge on the client.
- **Evaluation Harness:** Automated evaluation suite (`evals/`) checking schema compliance and zero solution leakage across test suites.

### For Students
- **Personalized Accounts:** Secure sign-up, login, and an integrated user profile with streamlined settings management.
- **Responsive Layout:** Viewport-bounded fixed sidebar ensuring smooth and stable navigation without layout shifts.
- **Hierarchical Tracking:** Organize questions into Topics and Subtopics.
- **Decoupled Metric Architecture:** Sheet progress bars remain isolated to `/app/sheet`. The dashboard "Total Solved" hero metric strictly aggregates solved counts from linked competitive platforms (LeetCode, Codeforces, CodeChef, GFG, AtCoder).
- **Real-Time Integration Sync:** Live scraping with real-time Server-Sent Events (SSE) streaming progress bar (`0%` - `100%`) and automatic cache hydration on completion.
- **Platform Filtering & Toggles:** Switch seamlessly between "All Platforms", "AlgoForge Sheets", "LeetCode", or "Codeforces" views on your dashboard.
- **Global Command Palette:** Fast keyboard-first navigation with `Ctrl+K` accessible across all pages.
- **In-App Notifications Bell:** Central notification dropdown alerting you when background syncs complete.
- **Spaced Repetition & Practice Plans:** SM-2 based spaced repetition system that generates daily review queues and custom practice plans.
- **Rich Metadata & Notes:** Track difficulty, platforms, and company tags with markdown-supported study notes.
- **Drag-and-Drop:** Reorder topics and questions with zero-latency optimistic UI updates.
- **Data Export:** Complete JSON snapshot download of user curriculum, attempts, and connected integrations.

### Contest Tracker
- **Multi-Platform Aggregation:** Real-time contest tracking for LeetCode, Codeforces, CodeChef, and AtCoder.
- **Live Countdowns & Reminders:** Add upcoming competitions directly to Google Calendar and view active live countdown timers.
- **Linked Standings:** View current ratings across all connected platforms in one place.

### Social & Growth
- **Public Profiles:** Share progress, activity heatmap, and stats via a public `/u/username` profile.
- **Sheet Templates & Community:** Publish sheets, clone templates with synchronous fallback, preview sheets before cloning, share direct links (`/app/discover?sheet=:id`), and delete authored sheets.
- **Study Groups:** Create groups, invite peers with an invite code, and compete on weekly leaderboards.

### Engineering Excellence
- **Strictly Typed:** 100% TypeScript across frontend and backend, with a shared `@algoforge/shared` package for schemas.
- **Distributed Background Processing & SSE:** BullMQ & Redis worker pipeline for asynchronous jobs alongside real-time SSE streaming for live sync operations.
- **ACID Data Integrity:** Multi-query database operations encapsulated inside atomic Prisma `$transaction` pipelines with raw SQL batch reordering.
- **Granular Cache Invalidation:** Redis cache-aside pattern with fine-grained tags (`user:{userId}:topics`, `user:{userId}:analytics`, `user:{userId}:integrations`, `user:{userId}:profile`, `user:{userId}:review`).
- **SQL-Native Analytics:** Advanced PostgreSQL raw queries (`GROUP BY`, conditional sums, CTEs) in `analytics.repository.ts`.
- **Advanced Security:** JWT Auth (HttpOnly cookies), Token Family Lineage, granular Rate Limiting, prototype pollution protection, and strict Zod payload validation.
- **Robust Testing:** Vitest & Supertest infrastructure with mocked ORM layers. Playwright for E2E.
- **Extreme Performance:** React window virtualization (`@tanstack/react-virtual`), Prisma `.select` payload pruning, Vite manual chunking, and Redis Brotli cache compression (`zlib.brotliCompress`).

---

## 🛠 Tech Stack

| Frontend | Backend | Infrastructure |
|---|---|---|
| React 19 + Vite | Node.js 20 | PostgreSQL (Prisma ORM & Transactions) |
| React Router (Routing) | Express 5 | Redis (Caching & Job State) |
| React Query (Server State) | Google Gemini 2.5 (`@google/genai`) | BullMQ (Background Processing & Cron) |
| Zustand (UI State) | Server-Sent Events (SSE Streaming) | Docker & Playwright |
| Tailwind CSS & dnd-kit | Zod (Validation) | Sentry (Error Tracking & Profiling) |
| Vite (Build Tool) | JWT Authentication (Token Lineage) | pnpm Workspaces + Turborepo |

---

## 🚀 Quick Start (Docker - Recommended)

The easiest way to run the API server and Web client via Docker. Note: Database and Redis connections use cloud-managed instances (e.g. Neon PostgreSQL, Upstash Redis) configured via `./server/.env`.

**1. Clone and configure:**
```bash
git clone https://github.com/yourusername/AlgoForge.git
cd AlgoForge
cp .env.example .env
```

**2. Start the stack:**
```bash
pnpm run docker:up
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

---

## 💻 Manual Setup (Local Development)

If you prefer to run the apps locally for development:

**Prerequisites:**
- Node.js 20+
- PostgreSQL (Local or managed e.g., Supabase/Neon)
- Redis (Optional, degrades gracefully if not provided)

**1. Install dependencies:**
```bash
pnpm install
```

**2. Environment variables:**
Configure your `.env` in the `server/` directory with your Postgres connection string.

**3. Database setup:**
```bash
cd server
npx prisma migrate dev
cd ..
```

**4. Start development servers:**
```bash
pnpm run dev
```

---

## 📜 Available Scripts

Run these from the root directory:

| Command | Description |
|---|---|
| `pnpm install` | Installs dependencies using pnpm workspaces. |
| `pnpm run dev` | Starts the Vite frontend and Express backend in dev mode via Turborepo. |
| `pnpm run build` | Builds both frontend and backend for production. |
| `pnpm run lint` | Runs ESLint on all packages. |
| `pnpm run test` | Runs the backend unit tests using Vitest. |
| `pnpm run test:coverage` | Runs unit tests with code coverage report. |
| `pnpm run test:e2e` | Runs E2E tests using Playwright. |
| `pnpm run docker:up` | Builds and starts all containers. |

---

## 🧪 Testing & Code Quality

AlgoForge treats testing as a first-class citizen. 

```bash
pnpm run test
pnpm run test:coverage
```
*Note: Backend unit tests run entirely in-memory using `vitest-mock-extended` for Prisma. No database connection is required.*

**E2E Testing:** Playwright is configured in the `e2e/` directory for full browser flow testing.

**CI:** Every push to `main` triggers a GitHub Actions pipeline that enforces Type-checking, Linting, and Test coverage.

---

## 🗺️ API Overview

All endpoints are versioned under `/api/v1/`. Responses follow a consistent envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": "Error message if success is false"
}
```

| Domain | Endpoints |
|---|---|
| **AI Sheet Agent**| `POST /sheets/agent/plan`, `POST /sheets/agent/apply` |
| **AI Study Coach**| `GET /ai/study-coach-plan` |
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/me` |
| **Topics** | `GET /topics`, `POST /topics`, `PUT /topics/:id`, `PUT /topics/reorder`, `DELETE /topics/:id`, `GET /topics/stats` |
| **SubTopics**| `POST /topics/:topicId/subtopics`, `PUT /subtopics/:subTopicId`, `PUT /topics/:topicId/subtopics/reorder`, `DELETE /subtopics/:subTopicId` |
| **Questions**| `POST /topics/:topicId/questions`, `POST /topics/:topicId/subtopics/:subTopicId/questions`, `PUT /questions/:questionId`, `PATCH /questions/:questionId/solved`, `PATCH /questions/:questionId/star`, `PUT /questions/:questionId/notes`, `PUT /questions/reorder`, `DELETE /questions/:questionId`, `POST /questions/:questionId/attempts` |
| **Integrations**| `GET /integrations`, `POST /integrations`, `DELETE /integrations/:platform`, `POST /integrations/sync`, `GET /integrations/sync/stream` (SSE), `GET /integrations/heatmap` |
| **Analytics**| `GET /analytics/summary`, `GET /analytics/heatmap`, `GET /analytics/topic-mastery`, `GET /analytics/weak-areas`, `GET /analytics/velocity` |
| **Notifications**| `GET /notifications`, `POST /notifications/read`, `POST /notifications/read-all` |
| **Users**| `PATCH /users/me/profile`, `GET /users/check-username`, `GET /users/:username/profile` |
| **Data Export**| `POST /export`, `GET /export/download` |
| **Sheets**| `POST /sheets/publish`, `GET /sheets`, `GET /sheets/:id`, `POST /sheets/:id/clone`, `DELETE /sheets/:id`, `GET /sheets/my/created` |
| **Groups**| `POST /groups`, `POST /groups/join`, `GET /groups`, `GET /groups/:id` |
| **Practice/Review**| `GET /practice/daily`, `GET /review/due`, `GET /review/stats` |
| **Contests** | `GET /contests` |
| **Trash** | `GET /trash`, `PATCH /trash/:id/restore`, `DELETE /trash/:id` |
| **System** | `GET /health`, `GET /csrf-token` |

---

## 📝 License

MIT License - Created by Pulkit Jain.
