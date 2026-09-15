# AlgoForge Architecture

AlgoForge is a full-stack Data Structures and Algorithms (DSA) preparation platform. This document outlines the system design, technical decisions, and data flow.

## 1. High-Level System Overview

```mermaid
graph TD
    Client[Client Browser<br/>Vite + React + Zustand]
    API[Express REST API<br/>Node.js 20]
    DB[(PostgreSQL)]
    Cache[(Redis Cache)]

    Client <-->|JSON over HTTPS| API
    API <-->|Prisma ORM| DB
    API <-->|ioredis| Cache
    API -->|enqueue job| BullMQ[(BullMQ)]
    BullMQ -->|process| Worker[Background Worker]
    Worker <-->|Prisma ORM| DB
    Worker <-->|ioredis| Cache
```

## 2. Backend Architecture (Layered)

The backend follows a strict layered architecture to separate concerns, making the system testable and maintainable.

| Layer | Responsibility | Technologies |
|---|---|---|
| **Shared** | Zod schemas and TypeScript types shared across apps. | `@algoforge/shared` |
| **Routes** | Defines API endpoints and attaches middleware & rate limiters. | Express Router |
| **Middleware** | Intercepts requests for auth, validation, and rate limiting. | Zod, Helmet, JWT, Rate Limit |
| **Controllers** | Thin adapters. Parses `req`, calls Service, sends `res`. | Express 5 |
| **Services** | Core business logic. No HTTP knowledge. | TypeScript |
| **Repositories** | Dedicated Data Access Layer (Class-based singletons). | Prisma ORM, ioredis |

## 3. Authentication & Security Pipeline

AlgoForge uses stateless JWT authentication via `HttpOnly` cookies to protect against XSS attacks.

**Middleware & Token Pipeline Order:**
1. `helmet()` — Sets secure HTTP headers and Content Security Policy (CSP).
2. `rateLimit()` — Granular limiters (global + strict limits for login/register/refresh/sync).
3. `sanitize()` — Strips dangerous keys to prevent NoSQL injection and Prototype Pollution.
4. `cookieParser()` — Parses `HttpOnly` cookies.
5. `doubleCsrfProtection` — Validates CSRF tokens using the Double Submit Cookie pattern.
6. `requestId` / `requestLogger` — Injects traceability UUIDs and logs via Pino.
7. `protect` (Route-level) — Verifies JWT signature and expiry.
8. `validate` (Route-level) — Strict Zod schema enforcement using `@algoforge/shared`.

**Session Management & Replay Protection:**
Refresh tokens use a **Token Family Lineage** architecture. Every session has a unique `family` ID. If an already-used (revoked) refresh token is presented again (indicating a potential replay attack or stolen token), the system instantly invalidates the entire token family, terminating all active sessions for that device.

## 4. Frontend Architecture

- **Routing & Layout:** `react-router-dom` is used for multi-page routing, featuring `AuthLayout` for public routes and `AppLayout` with `ProtectedRoute` for authenticated sessions. The `AppLayout` features a resilient, viewport-bounded fixed sidebar (`100dvh`) that ensures stable UI transitions without layout shifts.
- **State Management:**
  - **Server State:** `@tanstack/react-query` handles all API communication, caching, synchronization, and optimistic UI updates for rapid interactions.
  - **UI State:** `Zustand` (`useUIStore`) is restricted strictly to global transient UI states (like command palette visibility and navigation targets).
- **Component Design:** The codebase follows a feature-based architecture (`features/sheet`, `shared`, `features/profile`) prioritizing focused, decomposed components over monoliths. The Settings and Profile flow are deeply integrated to offer streamlined account management.
- **Drag-and-Drop:** `@dnd-kit` powers the smooth interactive reordering of topics, subtopics, and questions with custom sortable list strategies.

## 5. Caching Strategy

AlgoForge applies a **Cache-Aside** pattern backed by Redis (`ioredis`) to optimize heavy database operations across multiple modules:

- **Cached Domains:**
  - **Contests:** Cross-platform contest aggregation results (LeetCode, Codeforces, CodeChef, AtCoder).
  - **Analytics:** Summary, heatmaps, streaks, topic mastery, weak areas, and weekly velocity.
  - **Spaced Repetition:** Daily review queues and review stats.
  - **Integrations & Profiles:** Platform stats and public user profiles.
- **TTL & Tag-Based Invalidation:** Cache entries use a 5-minute TTL with explicit `setWithTag(key, tag, data, ttl)` tagging under `user:{userId}`. Mutating operations (create, update, delete, reorder) trigger `invalidateTag(tag)` for instant cache consistency.
- **Graceful Shutdown & Degradation:** Graceful termination safely closes Redis connections via `redis.quit()`. If Redis is offline or unconfigured, operations seamlessly fallback to PostgreSQL without application failure.

## 6. Background Processing & Distributed Workers (BullMQ)

To keep the API fast and prevent long-running I/O or scheduled maintenance from blocking HTTP requests, AlgoForge utilizes a modular background job processing architecture backed by Redis and BullMQ:

```
server/src/workers/
├── index.ts              ← Worker initialization, event listeners & job dispatch registry
├── queues.ts             ← Queue definitions exported for services to enqueue jobs
└── processors/
    ├── platformSync.ts   ← Synchronizes third-party profile stats (LeetCode, Codeforces)
    ├── trashPurge.ts     ← Daily scheduled job hard-deleting soft-deleted items > 30 days
    ├── tokenCleanup.ts   ← Daily scheduled job removing expired & stale revoked tokens
    ├── sheetClone.ts     ← Batched transactional cloning of public sheets
    └── dataExport.ts     ← Asynchronous user data serialization and export
```

- **Queue Engine**: `bullmq` running on the Redis instance with automatic retries and exponential backoff.
- **Job Registry**: A centralized dispatcher pattern in `workers/index.ts` routes jobs cleanly to pure processor functions.
- **Scheduled Maintenance (Cron)**: Automated repeatable jobs run during off-peak hours for database hygiene (e.g., daily trash purge at 3:00 AM UTC, token cleanup at 4:00 AM UTC).
- **Cache Invalidation**: Upon job completion, workers independently trigger `cache.invalidateTag()` so the frontend automatically receives fresh data on subsequent requests.

## 7. Database Transactions & ACID Consistency

To prevent orphaned records and concurrency race conditions, all multi-step database mutations are encapsulated within atomic **Prisma database transactions** (`prisma.$transaction`):

- **Question Attempts (`addAttemptTransaction`):** Creates the attempt record and increments question attempt counters/status atomically in a single pipeline.
- **Refresh Token Rotation (`rotateToken`):** Atomically revokes the old refresh token and creates the new child token in the same session family.
- **Group Exit (`leaveGroupTransaction`):** Atomically removes the group member, checks remaining member counts, and deletes the orphaned group if no members remain.
- **Hierarchical Reordering (`reorder`):** Updates the display orders across multiple topics, subtopics, or questions within a single transactional batch.
- **Background Maintenance:** Batch deletions during trash purging and token cleanups run inside atomic transactions.

## 8. Data Model (PostgreSQL)

```mermaid
erDiagram
    User ||--o{ Topic : owns
    Topic ||--o{ SubTopic : contains
    Topic ||--o{ Question : contains
    SubTopic ||--o{ Question : contains
    User ||--o{ QuestionAttempt : makes
    Question ||--o{ QuestionAttempt : has
    Question ||--o{ QuestionTag : tagged_with
    Tag ||--o{ QuestionTag : categorizes
    User ||--o{ Sheet : publishes
    User ||--o{ GroupMember : joins
    Group ||--o{ GroupMember : has
    User ||--o{ RefreshToken : authenticates

    User {
        String id PK
        String name
        String email
        String password
        String username
        String bio
        String avatarUrl
        Boolean isProfilePublic
        String defaultHeatmapRange
    }
    RefreshToken {
        String id PK
        String token
        String userId FK
        String family
        Boolean isRevoked
        DateTime expiresAt
    }
    Sheet {
        String id PK
        String title
        String description
        String authorId FK
        Boolean isPublic
        Json topics
    }
    Group {
        String id PK
        String name
        String inviteCode
    }
    GroupMember {
        String id PK
        String groupId FK
        String userId FK
        String role
    }
    PlatformIntegration {
        String id PK
        String userId FK
        String platform
        String username
        Int solvedCount
        Int rating
        Int maxRating
        Int contributions
        String tier
        Json activityData
    }
    Topic {
        String id PK
        String title
        Int order
        String userId FK
        DateTime deletedAt
    }
    SubTopic {
        String id PK
        String title
        Int order
        String topicId FK
        DateTime deletedAt
    }
    Question {
        String id PK
        String title
        Boolean isSolved
        String difficulty
        String topicId FK
        String subTopicId FK
        DateTime deletedAt
        DateTime lastAttemptedAt
        Int attemptCount
        DateTime nextReviewAt
    }
    QuestionAttempt {
        String id PK
        DateTime solvedAt
        Int confidence
        String questionId FK
        String userId FK
    }
    Tag {
        String id PK
        String name
        String category
    }
    QuestionTag {
        String questionId FK
        String tagId FK
    }
```

## 9. Intelligence Layer & Spaced Repetition

AlgoForge incorporates an intelligent learning system to optimize study efficiency:

- **Spaced Repetition (SM-2 Variant):** Questions are scheduled for review based on a modified SM-2 algorithm. When a user submits an attempt, they provide a self-evaluated confidence score (1-5). The system calculates the next optimal review date (`nextReviewAt`) to maximize retention.
- **Analytics Engine:** The `analytics.service.ts` uses optimized database query projections (selecting `solvedAt` columns with composite indexes `(userId, solvedAt)`) and calculates streaks, weekly velocity, and topic mastery percentages without full-table memory scans.
- **Daily Practice Plans:** The `practice.service.ts` dynamically generates a daily practice session by pulling from three strategic queues:
  1. **Review Queue:** Questions due for spaced repetition today.
  2. **Weak Areas:** Topics where the user's mastery percentage is under 50%.
  3. **Random Exploration:** A selection of completely unsolved questions picked using a Fisher-Yates random shuffle on unsolved IDs.

## 10. Social & Growth Features

AlgoForge includes networking effects designed to encourage collaborative learning:
- **Public Profiles**: Users can opt-in to display their statistics, heatmap, and bio on a public `/u/username` page.
- **Sheet Templates**: Users can publish a snapshot of their current topic tree to the public directory, allowing others to discover and clone curated question lists.
- **Study Groups**: Users can form study groups by generating an invite code. Group leaderboards track weekly problem-solving velocity among peers.

## 11. Error Handling

Express 5 natively catches rejected promises, eliminating the need for `try/catch` in controllers. Errors bubble up to `errorHandler.ts`, which categorizes them:
- **ZodError:** 400 Bad Request with field-level details.
- **CSRF Error:** 403 Forbidden on invalid or missing tokens.
- **Prisma Errors:** e.g., `P2002` maps to 409 Conflict.
- **AppError:** Custom operational errors (e.g., 404 Not Found, 403 Forbidden).
- **Unknown Errors:** Captured by Sentry (`@sentry/node` & `@sentry/react`), logged via Pino, and obscured as 500 Internal Server Error to prevent leaking stack traces.

## 12. Testing Infrastructure

- **Backend:** Vitest + Supertest.
- **Frontend:** Vitest + React Testing Library (`@testing-library/react` and `@testing-library/jest-dom`).
- **End-to-End (E2E):** Playwright for full browser integration tests.
- **Mocking:** `vitest-mock-extended` deeply mocks the `PrismaClient` and Redis utility.
- **Advantage:** Unit tests run entirely in-memory at lightning speed without requiring a live Docker database container, while E2E tests provide confidence in user flows.

## 13. Containerization

The project uses multi-stage Docker builds to minimize image sizes.
- **Builder Stage:** Installs all `devDependencies` and compiles TypeScript / Vite.
- **Runner Stage:** Copies only the compiled `dist/` folders and installs production dependencies, reducing attack surface and container size.
- **Cloud Database Configuration:** Containers connect to cloud-managed database/cache services (e.g. Neon PostgreSQL, Upstash Redis) provided via environment variables in `./server/.env`, eliminating containerized DB overhead.
