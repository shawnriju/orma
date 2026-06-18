# Product Requirements Document
## NoteFlash — Notes & Flashcard Learning App

**Version:** 0.1 (MVP)
**Last Updated:** June 2026
**Author:** Shawn
**Status:** Pre-development

---

## 1. Problem Statement

Students and self-learners currently use multiple disconnected tools to take notes, generate study material, and review content. Existing solutions each solve one part of the problem:

- **Notion** — great for notes, but free tier storage limits and no study features
- **Obsidian** — excellent editor UX, but local-only with no backup unless you pay for Sync
- **NotebookLM** — excellent for AI-generated study aids, but not a notes app
- **Anki** — powerful spaced repetition, but completely disconnected from where notes live

The result: users copy-paste between tools, lose context, and eventually give up on structured studying.

**Core insight:** If the notes and the study system live in the same place, the friction to actually study drops to near zero.

---

## 2. Vision

Make learning as approachable and frictionless as possible. Anyone should be able to open the app, write notes, and immediately convert them into a study system — without needing to know what spaced repetition is or how to set up a flashcard deck.

Long-term, the product expands into a productivity layer that actively enforces study habits — blocking distracting apps until the user completes their daily review.

---

## 3. Target Users

**Primary (MVP):** Students, self-learners, and knowledge workers who actively take notes and want to study more effectively. Comfortable with web apps. Frustrated by the notes-to-study-material gap.

**Secondary (Phase 2+):** People who want external accountability tools — app blockers, streaks, habit enforcement — to help them study consistently.

---

## 4. Product Phases

### Phase 1 — MVP (Web App)
A clean, fast notes app with AI-powered flashcard generation and cloud backup.

### Phase 2 — Expanded Web App
Spaced repetition scheduling, study streaks, learning analytics, and deeper AI features (concept explanation, note summarisation).

### Phase 3 — Mobile App
Native iOS and Android app. Includes app-blocking feature: users must complete a flashcard review session before accessing blocked apps (Instagram, Reddit, etc.). Uses iOS Screen Time / FamilyControls API and Android UsageStatsManager.

### Phase 4 — Desktop App (Optional)
Local-first Tauri desktop app for users who want an Obsidian-like offline experience with optional cloud sync.

---

## 5. MVP Feature Scope

### 5.1 Notes Editor

**Must have:**
- Block-based rich text editor (Tiptap) with slash command menu
- Support for: headings (H1–H3), paragraphs, bullet lists, numbered lists, checkboxes, code blocks, callout blocks, dividers
- Inline formatting: bold, italic, underline, inline code, highlight
- Folders/notebooks for organising notes
- Note search (full-text)
- Auto-save (debounced, every 2 seconds)
- Markdown export per note

**Nice to have (post-MVP):**
- Drag-to-reorder blocks
- Note tagging
- Backlinks between notes

### 5.2 Cloud Storage & Backup

**Must have:**
- All notes stored in Supabase Postgres (authenticated, per-user)
- Optional Google Drive backup: export notes as `.md` files to user's own Drive
- User authenticates with their own Google account — data stored in their Drive, not ours

**Nice to have:**
- Dropbox backup
- Auto-backup on schedule (daily/weekly)

### 5.3 Authentication

**Must have:**
- Email + password sign up / login (Supabase Auth)
- Google OAuth sign in
- Protected routes — no notes accessible without auth

### 5.4 Flashcard Generation

**Must have:**
- Select any text within a note → click "Generate Flashcards"
- Alternatively, click "Generate from full note"
- Calls Claude API (Haiku model) with selected content
- Returns 5–10 question/answer flashcard pairs
- User can review, edit, or delete individual cards before saving
- Cards saved to their own data model, linked back to the source note

### 5.5 Flashcard Review Mode

**Must have:**
- Simple flip-card UI
- User marks each card as "Got it" or "Missed it"
- Basic SM-2 spaced repetition: cards due for review surfaced first
- Review session summary (cards reviewed, accuracy %)

**Not in MVP:**
- Full SM-2 interval scheduling (simplified version only)
- Streak tracking

---

## 6. Out of Scope for MVP

- App blocking (Phase 3)
- Mobile app (Phase 3)
- Desktop app (Phase 4)
- Collaborative notes
- Public note sharing
- Plugin ecosystem
- Offline mode
- Custom AI model selection

---

## 7. Non-Functional Requirements

- **Performance:** Note saves must feel instant (optimistic UI). Editor must not lag on notes up to 10,000 words.
- **Reliability:** Notes must never be lost. Supabase handles persistence; UI shows save status clearly.
- **Security:** All API routes authenticated via Supabase JWT. LLM endpoint rate-limited per user. No user data passed to LLM beyond selected content.
- **Cost:** MVP must be operable at near-zero cost. LLM calls use Claude Haiku (cheapest tier). Supabase free tier (500MB) is sufficient for early users.
- **Accessibility:** Keyboard navigable editor. Sufficient colour contrast. No reliance on colour alone for state.

---

## 8. Success Metrics (MVP)

- User can create an account and write a note within 2 minutes of landing on the app
- User can generate flashcards from a note in under 30 seconds
- Notes persist correctly across sessions and devices
- Google Drive backup exports correctly formatted `.md` files
- Zero data loss incidents

---

## 9. Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Editor | Tiptap (ProseMirror-based block editor) |
| Backend API | Hono (TypeScript), deployed on Railway |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (email + Google OAuth) |
| File Storage | Cloudflare R2 (attachments), Google Drive API (backup) |
| AI | Anthropic Claude API (Haiku model for flashcard generation) |
| Frontend Hosting | Vercel (free tier) |
| Backend Hosting | Railway ($5/mo hobby plan) |
| Background Jobs | Inngest (spaced repetition scheduling, Phase 2) |

---

## 10. Open Questions

- What should the app be called? (working name: NoteFlash)
- Should flashcard decks be auto-named after the source note, or user-named?
- Should we support image attachments in notes at MVP, or text-only?
- What's the rate limit on flashcard generation per user per day on free tier?
