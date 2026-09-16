# AlgoForge ⚡

A highly optimized, full-stack Data Structures and Algorithms (DSA) preparation platform designed to help software engineers track their interview prep progress.

> **Architecture Deep-Dive:** Want to see how the system is engineered? Read the [ARCHITECTURE.md](./ARCHITECTURE.md) for a breakdown of the layered design, caching strategy, and security pipeline.

---

## 🎯 Key Features

### For Students
- **Personalized Accounts:** Secure sign-up, login, and an integrated user profile with streamlined settings management.
- **Responsive Layout:** Viewport-bounded fixed sidebar ensuring smooth and stable navigation without layout shifts.
- **Hierarchical Tracking:** Organize questions into Topics and Subtopics.
- **Unified Multi-Platform Analytics:** Visual indicators of solved questions, difficulty distribution (Easy, Medium, Hard), weekly velocity, activity heatmaps, and topic mastery radar charts—aggregating both native AlgoForge sheet attempts and synced data from LeetCode & Codeforces.
- **Platform Filtering & Toggles:** Switch seamlessly between "All Platforms", "AlgoForge Sheets", "LeetCode", or "Codeforces" views on your dashboard to inspect platform-specific or aggregated progress.
- **Global Command Palette:** Fast keyboard-first navigation with `Ctrl+K` accessible across all pages to quickly jump to topics, problems, and views.
- **In-App Notifications Bell:** Central notification dropdown with real-time polling and unread badges alerting you when third-party platform syncs complete.
- **Spaced Repetition & Practice Plans:** SM-2 based spaced repetition system that generates daily review queues and custom practice plans targeting weak areas.
- **Rich Metadata & Notes:** Track difficulty, platforms (LeetCode, GFG, Codeforces), and company tags with markdown-supported study notes.
- **Drag-and-Drop:** Freely reorder your curriculum to match your study plan with zero-latency optimistic UI updates.
- **Modern UI Polish:** Branded glowing loading spinners, realistic skeleton cards, custom styled confirmation modals, and helpful empty states.

### Contest Tracker
- **Multi-Platform Aggregation:** Real-time contest tracking for LeetCode, Codeforces, CodeChef, and AtCoder.
- **Live Countdowns & Reminders:** Add upcoming competitions directly to Google Calendar and view active live countdown timers.
- **Linked Standings:** View your current ratings across all connected platforms in one place.

### Social & Growth
- **Public Profiles:** Share your progress, activity heatmap, and stats via a public `/u/username` profile.
- **Sheet Templates:** Publish your curriculum as a public template, and discover/clone sheets created by the community.
- **Study Groups:** Create groups, invite peers with an invite code, and compete on weekly leaderboards.

### Engineering Excellence
- **Strictly Typed:** 100% TypeScript across frontend and backend, with a shared `@algoforge/shared` package for schemas.
- **Distributed Background Processing:** BullMQ & Redis worker pipeline offloading heavy third-party platform syncs and scheduled maintenance jobs (automated trash purges, token cleanups, and automated sync-completion notifications).
- **ACID Data Integrity:** Multi-query database operations (token rotation, attempts, group lifecycle, reordering) encapsulated inside atomic Prisma `$transaction` pipelines. Highly optimized raw SQL `$executeRawUnsafe` statements (`CASE WHEN`) used for atomic batch reordering.
- **Granular Cache Invalidation:** Redis cache-aside pattern with fine-grained tags (e.g., `user:{userId}:topics`, `user:{userId}:analytics`, `user:{userId}:integrations`) enabling surgical invalidation without purging unrelated user caches.
- **SQL-Native Analytics:** Advanced PostgreSQL raw queries (`GROUP BY`, conditional sums, CTEs) push heavy analytics computations directly to the database layer via `analytics.repository.ts`.
- **Advanced Security:** JWT Auth (HttpOnly cookies), Token Family Lineage (replay attack protection with automatic session chain revocation), granular Rate Limiting, prototype pollution protection, and strict Zod payload validation.
- **Robust Testing:** Vitest & Supertest infrastructure with mocked ORM layers. Playwright for E2E.
- **Monorepo Architecture:** Managed by `pnpm` workspaces and `Turborepo` for blazingly fast CI and local builds.
- **Extreme Performance:** React window virtualization (`@tanstack/react-virtual`), Prisma `.select` payload pruning, Vite manual chunking, and Redis Brotli cache compression (`zlib.brotliCompress`) allow the system to scale to thousands of users effortlessly with instant TTI and minimal memory footprint.
- **Containerized:** Multi-stage Docker builds and `docker-compose` ready.

---

## 🛠 Tech Stack

| Frontend | Backend | Infrastructure |
|---|---|---|
| React 19 + Vite | Node.js 20 | PostgreSQL (Prisma ORM & Transactions) |
| React Router (Routing) | Express 5 | Redis (Caching & Job State) |
| React Query (Server State) | Zod (Validation) | BullMQ (Background Processing & Cron) |
| Zustand (UI State) | Pino (Structured Logging) | Docker & Playwright |
| Tailwind CSS & dnd-kit | JWT Authentication | pnpm Workspaces + Turborepo |

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
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/me` |
| **Topics** | `GET /topics`, `POST /topics`, `PUT /topics/:id`, `PUT /topics/reorder`, `DELETE /topics/:id` |
| **SubTopics**| `POST /topics/:topicId/subtopics`, `PUT /subtopics/:subTopicId`, `PUT /topics/:topicId/subtopics/reorder`, `DELETE /subtopics/:subTopicId` |
| **Questions**| `POST /topics/:topicId/questions`, `POST /topics/:topicId/subtopics/:subTopicId/questions`, `PUT /questions/:questionId`, `PATCH /questions/:questionId/solved`, `PATCH /questions/:questionId/star`, `PUT /questions/:questionId/notes`, `PUT /questions/reorder`, `DELETE /questions/:questionId`, `POST /questions/:questionId/attempts` |
| **Integrations**| `GET /integrations`, `POST /integrations`, `DELETE /integrations/:platform`, `POST /integrations/sync`, `GET /integrations/heatmap` |
| **Analytics**| `GET /analytics/summary`, `GET /analytics/heatmap`, `GET /analytics/topic-mastery`, `GET /analytics/weak-areas`, `GET /analytics/velocity` |
| **Notifications**| `GET /notifications`, `POST /notifications/read`, `POST /notifications/read-all` |
| **Users**| `PATCH /users/me/profile`, `GET /users/check-username`, `GET /users/:username/profile` |
| **Sheets**| `POST /sheets/publish`, `GET /sheets`, `GET /sheets/:id` |
| **Groups**| `POST /groups`, `POST /groups/join`, `GET /groups`, `GET /groups/:id` |
| **Practice/Review**| `GET /practice/daily`, `GET /review/due` |
| **Contests** | `GET /contests` |
| **Trash** | `GET /trash`, `PATCH /trash/:id/restore`, `DELETE /trash/:id` |
| **System** | `GET /health`, `GET /csrf-token` |

---

## 📝 License

MIT License - Created by Pulkit Jain.
