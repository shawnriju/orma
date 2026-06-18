# TypeScript & Next.js Frontend Coding Skill

This skill defines development standards for building type-safe, fast, and accessible user interfaces in the NoteFlash Next.js (App Router) application.

## 1. App Router & Server Components
- By default, all components are React Server Components (RSC).
- Use `"use client"` only when incorporating interactivity, hooks (`useState`, `useEffect`), or browser-only APIs.
- Keep Client Components low in the component tree to maximize server-side performance.

## 2. Type Safety & TypeScript
- Declare precise interfaces for all props, states, and API responses.
- Avoid the use of `any`. If a type is unknown or dynamic, use `unknown`.
- Synchronize database schema types by generating TypeScript interfaces directly from the Supabase Postgres schema.

## 3. Styling & Component Design
- Use Tailwind CSS v4 utility classes and CSS variables inside `globals.css` for consistent, unified layout styling.
- Rely on shadcn/ui components (Radix UI primitives) for accessible layout blocks (dialogs, sheets, menus).
- Ensure all interactive elements have hover and focus states, and support dark mode using Tailwind's `dark:` classes.

## 4. State Management & API Integration
- **Server State**: Use TanStack Query (`@tanstack/react-query`) for data fetching, caching, and background refetching.
- **Client State**: Use Zustand for lightweight, global client states (such as active editor layout or sidebar toggle).
- **Mutations**: Implement optimistic UI updates when performing mutations (like updating a note or changing a title) to keep user interactions feeling instantaneous.
