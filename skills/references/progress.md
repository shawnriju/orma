# Orma Development Progress Log

## Completed Accomplishments

### 1. Authentication & Route Security
- **Supabase Integration**: Set up email/password credentials authentication and Google OAuth sign-in flow.
- **Callback Exchange Route**: Implemented [route.ts](file:///c:/Dev/Projects/orma/apps/web/app/auth/callback/route.ts) resolving the auth code with Supabase SSR cookies via the Next.js `cookies()` helper to persist user sessions.
- **Protected Layout**: Added client-side session checks in the main layout redirecting unauthenticated users to `/login`.

### 2. Workspace Layout & Redirection Fallbacks
- **Directory Refactor**: Renamed Route Group from `(app)` to `(workspace)` (`app/(workspace)/...`) to improve semantics and structure.
- **Sidebar Navigation Shell**: Built the Left Sidebar featuring Notebooks navigation list, User session details, and Sign Out triggers.
- **Skeleton Pages**: Added index and placeholder pages to resolve 404 Page Not Found errors:
  - `/notes`: Lists notes under active notebooks, displaying search and text previews.
  - `/study`, `/library`, `/settings`: Added clean fallback templates.

### 3. Editor & Data Saving Engine
- **Tiptap Block Editor**: Configured Tiptap with debounced (2-second) saving using a `useRef` timer block to prevent overlapping network requests.
- **Word Count**: Integrated dynamic word count calculations.
- **Interactivity & CSS**: Added container-wide click listeners focusing the editor workspace area and defined rich text styling for `.ProseMirror` (headings, lists, blockquotes, placeholders) in `globals.css`.
- **Card Previews**: Updated the notes listing query to select `content` columns, rendering extracted plain-text previews on note cards.

### 4. Spaced Repetition Flashcard AI (`apps/api`)
- **OpenAI Service**: Configured the OpenAI client using `gpt-4o-mini` with strict structured JSON schema outputs and low temperature (0.25) to prevent hallucination.
- **API Endpoints**: Integrated `POST /api/v1/flashcards/generate` and `POST /api/v1/flashcards` to process selections/full note content, and save confirmed cards.
- **Safety Guardrails**: Implemented automated input safety moderation checks, character size constraints (max 10,000 characters), and validation rules rejecting low-context text (under 20 words).
- **UX Warning Feedback**: Improved the right panel sidebar to display clean descriptive feedback warnings when notes contain too little text or lack sufficient educational context.

### 5. Spaced Repetition Daily Review Redesign & Note Integration
- **Interactive Flip Card Session**: Refactored the daily review page into a stateful, interactive 3D flip card session with card-navigation controls (prev/next) and results summary.
- **Selective Note Study**: Redesigned the daily review dashboard to show a 'Study All Due' button and a list of active reviews grouped by note.
- **Completed Reviews Revisit**: Added a completed reviews section allowing users to study fully reviewed cards again.
- **Note Editor Footer Stats**: Embedded a footer stats bar inside the note page displaying saved and due counts with a 'Study Now' link.
- **Route Redirections**: Replaced hardcoded landing page links with standard workspace notes routing and added exit warnings to prevent accidental study session exits.
### 6. Notes List Actions & Editor Fixes
- **Tiptap Empty Content Warning Fix**: Added a sanitization helper `getSafeContent` in [Editor.tsx](file:///c:/Dev/Projects/orma/apps/web/components/editor/Editor.tsx) to map empty object content (`{}`) to `''` safely. Updated the backend `POST /` notes creation route in [notes.ts](file:///c:/Dev/Projects/orma/apps/api/src/routes/notes.ts) to populate new notes with a valid default Tiptap document structure (`{ type: 'doc', content: [] }`) instead of `{}`.
- **Card Context Actions (Rename & Delete)**: Added a stateful context menu (`MoreVertical` dropdown) inside individual cards on the Notes list dashboard ([page.tsx](file:///c:/Dev/Projects/orma/apps/web/app/\(workspace\)/notes/page.tsx)) containing:
  - **Rename**: Prompts users to rename the note and triggers the PATCH API mutation.
  - **Delete**: Prompts for confirmation and deletes the note record via the DELETE API mutation.
- **Active Note Deletion**: Integrated a **Delete Note** option into the existing three-dots (`MoreHorizontal` dropdown) menu in the workspace editor top bar header ([page.tsx](file:///c:/Dev/Projects/orma/apps/web/app/\(workspace\)/notes/\[noteId\]/page.tsx)), allowing users to delete the active note and redirecting them back to `/notes`.

### 7. Flashcard Magic Study Modal UX & Existing Cards Panel
- **Collapsible UI**: Redesigned the draft cards in the Magic Study modal ([FlashcardPanel.tsx](file:///c:/Dev/Projects/orma/apps/web/components/flashcards/FlashcardPanel.tsx)) to render collapsed by default (displaying only a truncated question) with `ChevronUp`/`ChevronDown` toggle controls to reduce scroll fatigue.
- **Bulk Card Operations**: Implemented individual card checkboxes and a global "Select All" toggle, allowing users to bulk delete selected draft cards easily.
- **Existing Cards Side Panel**: Added a split-view right-side panel to the note editor ([page.tsx](file:///c:/Dev/Projects/orma/apps/web/app/\(workspace\)/notes/\[noteId\]/page.tsx)) that fetches and displays previously generated flashcards via `@tanstack/react-query`.
- **Editor Header Refactor**: Replaced the three-dots context menu in the note editor with direct, accessible action buttons for toggling the Cards panel and Deleting the Note.

### 8. Global Flashcard Editing System
- **Backend Mutations**: Added `PATCH /api/v1/flashcards/:id` and `DELETE /api/v1/flashcards/:id` endpoints to the `flashcards.ts` Hono router for modifying saved records.
- **Reusable Edit Modal**: Created a centralized `EditFlashcardModal.tsx` component that allows users to edit a card's question/answer or delete it completely. It uses `useMutation` to hit the API and instantly invalidates React Query `['flashcards']` and `['study']` caches to keep UI state in sync.
- **Multi-Context Integration**: Added an inline "Edit" button (pencil icon) to flashcards in two key areas:
  - **Note Editor Side Panel**: Users can edit/delete flashcards directly while viewing the related note.
  - **Daily Review Study Session**: Users can fix typos on the fly during 3D flip-card reviews without interrupting their study flow.

### 9. Real SM-2 Spaced Repetition & Daily Review UI
- **SM-2 Algorithm Integration**: Implemented a true SM-2 scheduling algorithm (`computeNextInterval` and `previewIntervals`) to dynamically calculate ease factors, intervals, and repetitions for flashcards based on user ratings (Hard, OK, Easy).
- **Backend API Routes**: 
  - Added `GET /api/v1/study/daily-queue` and `GET /api/v1/study/due-count` for fetching due cards respecting daily limits.
  - Added `POST /api/v1/study/session` to track streaks and daily study history.
  - Created a new `profiles` router (`GET /me`, `PATCH /me`) to manage user limits.
- **Frontend Navigation Reorganization**: Renamed the old "Daily Review" to "Study" (Free form review) and added a dedicated new "Daily Review" link to the sidebar.
- **New Daily Review UX**: 
  - Created `apps/web/app/(workspace)/daily-review/page.tsx` with comprehensive states (`loading`, `start`, `empty`, `reviewing`, `complete`).
  - Implemented interval hint previews ("Tomorrow", "~3 days") under rating buttons dynamically populated by the SM-2 utility.
  - Added session completion feedback with streak tracking and an accuracy score to motivate consistency.
- **Settings & User Preferences**:
  - Implemented end-to-end flow in `apps/web/app/(workspace)/settings/page.tsx` to update `daily_review_limit` and `email_notifications_enabled`.
  - Backend dynamically uses `daily_review_limit` to restrict the Daily Review queue.
- **Study Screen Refactor**:
  - Transformed `/app/(workspace)/study/page.tsx` into a free-form flashcard browser.
  - Groups all flashcards by note, with expandable inline answers and "Study Note" capabilities.
  - Free-form study completely decoupled from SRS (no longer hits `/study/review` API).
- **Background Jobs (Inngest)**:
  - Installed and configured Inngest in `apps/api`.
  - Created `dailyEmailAlert` cron function using Supabase Service Role to query opted-in users and due cards.
  - Mounted `/api/inngest` endpoint using Hono adapter for execution.

### 10. Study & Review Refinements
- **Inngest Configuration Fix**: Corrected the `createFunction` syntax in the background job to properly nest cron triggers inside the config object, resolving SDK initialization crashes.
- **SRS Database Query Fix**: Updated the `/daily-queue` and `/due-count` queries to include older flashcards that had a `null` value for `next_review_at` by using a `.or()` condition.
- **Overtime Daily Review Mode**: 
  - Added an `overtime=true` query parameter to the `/daily-queue` route to bypass time filters and fetch future due cards.
  - Added an "Overtime" study option to the Daily Review empty state.
  - Implemented a modal warning letting users know that overtime sessions actively alter their spaced repetition schedules.
- **Free Study UI Cleanup**: Removed the tracking tags from the free-form Study browser to  decouple it from spaced repetition logic for now(future scope to have some sort of tracking on the free study page), and configured note group headers to be collapsed by default for easier navigation.
