# Orma / NoteFlash

Orma is a lightweight notes and flashcard app with a Next.js frontend and a Hono + Supabase backend.

## What’s in the repo

- `apps/web` - Next.js App Router frontend with TypeScript, Tailwind, Zustand, TanStack Query, and Tiptap.
- `apps/api` - Hono API with Supabase auth checks, Inngest jobs, and AI-backed flashcard generation.
- `docs/` - Product, frontend, backend, and flow docs for the current MVP.

## Prerequisites

- Node.js 18 or newer
- npm or pnpm
- A Supabase project
- An OpenAI API key

## Environment variables

Create `apps/api/.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `FRONTEND_URL` - optional, defaults to `http://localhost:3000`
- `PORT` - optional, defaults to `3001`

Create `apps/web/.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` - for example `http://localhost:3001`

Do not commit service role keys.

## Local setup

Install dependencies in each app:

```powershell
cd apps/api
npm install

cd ../web
npm install
```

Run the backend:

```powershell
cd apps/api
npm run dev
```

The API listens on `http://localhost:3001` by default.

Run the frontend in a second terminal:

```powershell
cd apps/web
npm run dev
```

The frontend listens on `http://localhost:3000` by default.

## Scripts

### Backend (`apps/api`)

- `npm run dev` - start the API in watch mode
- `npm run build` - compile TypeScript
- `npm run start` - run the built server from `dist/index.js`

### Frontend (`apps/web`)

- `npm run dev` - start the Next.js dev server
- `npm run build` - build the production app
- `npm run start` - start the production app
- `npm run lint` - run ESLint

## Current app routes

Frontend routes currently include:

- `/` - marketing-style landing page
- `/login`
- `/signup`
- `/notes`
- `/notes/[noteId]`
- `/study`
- `/daily-review`
- `/library`
- `/settings`

## Backend notes

- The API exposes a `/health` endpoint.
- Authenticated routes are mounted under `/api/v1/*`.
- Inngest is mounted at `/api/inngest`.
- The backend uses Supabase for auth and persistence, plus OpenAI for AI-assisted flashcard generation.

## Testing

Playwright E2E tests, if configured, can be run with:

```powershell
npx playwright test
```


