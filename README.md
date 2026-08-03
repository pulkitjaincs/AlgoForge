# AlgoForge ⚡

A highly optimized, full-stack Data Structures and Algorithms (DSA) preparation platform designed to help software engineers track their interview prep progress.

> **Architecture Deep-Dive:** Want to see how the system is engineered? Read the [ARCHITECTURE.md](./ARCHITECTURE.md) for a breakdown of the layered design, caching strategy, and security pipeline.

---

## 🎯 Key Features

### For Students
- **Personalized Accounts:** Secure sign-up, login, and user profile management.
- **Hierarchical Tracking:** Organize questions into Topics and Subtopics.
- **Multi-page Dashboard:** Dedicated views for your main sheet, analytics dashboard, and spaced-repetition review.
- **Progress Metrics & Analytics:** Visual indicators of solved questions, streaks, weekly velocity, activity heatmaps, and topic mastery radar charts.
- **Spaced Repetition & Practice Plans:** SM-2 based spaced repetition system that generates daily review queues and custom practice plans targeting weak areas.
- **Rich Metadata:** Track difficulty, platforms (LeetCode, GFG), and company tags.
- **Study Notes & Timers:** Markdown-supported notes and inline timers attached directly to questions.
- **Drag-and-Drop:** Freely reorder your curriculum to match your study plan.

### Social & Growth
- **Public Profiles:** Share your progress, activity heatmap, and stats via a public `/u/username` profile.
- **Sheet Templates:** Publish your curriculum as a public template, and discover/clone sheets created by the community.
- **Study Groups:** Create groups, invite peers with an invite code, and compete on weekly leaderboards.

### Engineering Excellence
- **Strictly Typed:** 100% TypeScript across frontend and backend, with a shared `@algoforge/shared` package for schemas.
- **High Performance:** Redis cache-aside pattern for heavy hierarchical queries.
- **Secure:** JWT Auth (HttpOnly cookies), Zod validation, Helmet, Rate Limiting, and NoSQL/SQL injection prevention.
- **Robust Testing:** Vitest & Supertest infrastructure with mocked ORM layers. Playwright for E2E.
- **Monorepo Architecture:** Managed by `pnpm` workspaces and `Turborepo` for blazingly fast CI and local builds.
- **Containerized:** Multi-stage Docker builds and `docker-compose` ready.

---

## 🛠 Tech Stack

| Frontend | Backend | Infrastructure |
|---|---|---|
| React 19 + Vite | Node.js 20 | PostgreSQL (Prisma ORM) |
| React Router (Routing) | Express 5 | Redis (Caching) |
| React Query (Server State) | Zod (Validation) | Docker & Docker Compose |
| Zustand (UI State) | Pino (Structured Logging) | Playwright (E2E Testing) |
| Tailwind CSS & dnd-kit | JWT Authentication | pnpm Workspaces + Turborepo |

---

## 🚀 Quick Start (Docker - Recommended)

The easiest way to run the entire stack (Postgres + Redis + API + Web) is using Docker.

**1. Clone and configure:**
```bash
git clone https://github.com/yourusername/AlgoForge.git
cd AlgoForge
cp .env.example .env
```

**2. Start the stack:**
```bash
npm run docker:up
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
npm run install:all
```

**2. Environment variables:**
Configure your `.env` in the `server/` directory with your Postgres connection string.

**3. Database setup:**
```bash
cd server
npx prisma migrate dev
```

**4. Start development servers:**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

---

## 📜 Available Scripts

Run these from the root directory:

| Command | Description |
|---|---|
| `npm run install:all` | Installs dependencies for root, client, and server. |
| `npm run dev:client` | Starts the Vite frontend in dev mode. |
| `npm run dev:server` | Starts the Express backend in watch mode. |
| `npm run build` | Builds both frontend and backend for production. |
| `npm run lint` | Runs ESLint on both projects. |
| `npm run test` | Runs the backend unit tests using Vitest. |
| `npm run docker:up` | Builds and starts all containers. |

---

## 🧪 Testing & Code Quality

AlgoForge treats testing as a first-class citizen. 

```bash
npm run test
npm run test:coverage
```
*Note: Backend unit tests run entirely in-memory using `vitest-mock-extended` for Prisma. No database connection is required.*

**E2E Testing:** Playwright is configured in the `e2e/` directory for full browser flow testing.

**CI/CD:** Every push to `main` triggers a GitHub Actions pipeline that enforces Type-checking, Linting, and Test coverage.

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
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| **Topics** | `GET /topics`, `POST /topics`, `PUT /topics/:id`, `PUT /topics/reorder` |
| **SubTopics**| `POST /topics/:id/subtopics`, `PUT /subtopics/:id` |
| **Questions**| `POST /topics/:id/subtopics/:id/questions`, `PATCH /questions/:id/solved` |
| **Trash** | `GET /trash`, `PATCH /trash/:id/restore`, `DELETE /trash/:id` |
| **System** | `GET /health` |

---

## 📝 License

MIT License - Created by Pulkit Jain.
