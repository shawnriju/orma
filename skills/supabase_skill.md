# Supabase Agent Skill

This skill defines the guidelines and procedures for AI agents to interact with, manage, and query the Supabase database and authentication services in the NoteFlash project.

## 1. Schema & Migration Standards
- All database modifications must be written as SQL migrations before application.
- Standard PostgreSQL naming conventions: use `snake_case` for tables, columns, and indexes.
- Foreign keys must always include referential actions (`on delete cascade` or `on delete set null`).
- Enable Row-Level Security (RLS) on every new table by default.

## 2. Row Level Security (RLS) Policies
- All user-facing tables must restrict access: `auth.uid() = user_id`.
- Public/metadata tables must be readable only by authenticated users unless explicitly marked public.
- In Hono API, check ownership explicitly in query filters (e.g., `.eq('user_id', userId)`) even if using the service role key.

## 3. Server-Side vs Client-Side Clients
- **Backend (Hono)**: Uses the `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses RLS policies. The agent must enforce user isolation manually in the API handlers.
- **Frontend (Next.js)**: Uses the anonymous public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). All client-side operations are constrained by RLS policies.

## 4. Query Guidelines
- Use the JS/TS Client SDK (`@supabase/supabase-js`) for standard CRUD.
- For complex queries or aggregations not supported by the client builder, write a custom PostgreSQL Function (RPC) via migration and call it using `.rpc('function_name')`.
- Always select only the necessary columns (e.g., `.select('id, title')` rather than `.select('*')`) for performance and network efficiency.
