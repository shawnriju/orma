# Orma / NoteFlash

Lightweight note-taking and flashcard app with a Next.js frontend and a Hono + Supabase backend.

**Quick overview**
- **Frontend:** `apps/web` — Next.js (App Router), TypeScript, Tailwind, Zustand, TanStack Query.
- **Backend:** `apps/api` — Hono API, Supabase service role client, OpenAI integration.
- **Database / Auth:** Supabase (Postgres + RLS).

**Prerequisites**
- Node.js 18+ (recommended)
- npm or pnpm
- A Supabase project (URL + keys)
- An OpenAI API key (for AI flashcard generation)

Environment variables
- API (create `apps/api/.env` or export env vars):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` 
  - `OPENAI_API_KEY` 
  - `FRONTEND_URL` (optional, defaults to `http://localhost:3000`)
  - `PORT` (optional, defaults to `3001`)
- Frontend (create `apps/web/.env` or export env vars):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3001`)

Setup & run (local development)

1. Install dependencies for each app

```powershell
cd apps/api
npm install

cd ../web
npm install
```

2. Configure environment variables
- Create `apps/api/.env` and `apps/web/.env` with the variables listed above. Do not commit service role keys.

3. Run the backend (dev)

```powershell
cd apps/api
npm run dev
```

The API will run on `http://localhost:3001` by default (see `PORT`).

4. Run the frontend (dev)

```powershell
cd apps/web
npm run dev
```

The frontend runs on `http://localhost:3000` by default.

Build & production
- Backend: `cd apps/api && npm run build && npm run start` (builds TypeScript and runs `dist/index.js`).
- Frontend: `cd apps/web && npm run build && npm run start`.

Testing
- E2E tests are expected under `apps/web/e2e/` (Playwright). If configured, run:

```powershell
npx playwright test
```


