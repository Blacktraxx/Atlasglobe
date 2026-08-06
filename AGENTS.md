# AGENTS.md

## Project Context

This is a React + Vite app using Supabase for auth/database and Vercel for hosting. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and the Supabase/Vercel deploy workflow.

Auth is email + password only — there is no social login (e.g. Google) anywhere in this app. Do not reintroduce it without an explicit request.

## Key Files

- `src/`: frontend application source.
- `src/lib/supabaseClient.js`: Supabase browser client (reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`).
- `src/lib/AuthContext.jsx`: auth state and actions (sign in, sign up, sign out, password reset) built on `supabase.auth`.
- `src/api/entities.js`: data-access helpers for the `profiles`, `transactions`, and `support_messages` tables. Add new tables/queries here rather than calling `supabase.from(...)` directly from pages.
- `supabase/schema.sql`: source of truth for the database schema, row-level security policies, and the trigger that creates a `profiles` row on sign-up. Keep this file in sync with any schema changes and mention that the user needs to re-run it in the Supabase SQL editor.
- `vercel.json`: SPA rewrite so client-side routes resolve on Vercel.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` for local frontend development against your Supabase project (configured via `.env.local`).
- Any new entity/table needs: a table + RLS policies in `supabase/schema.sql`, and a corresponding helper in `src/api/entities.js`.
- Deployment is via Vercel; environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set in the Vercel project settings, not committed to the repo.
- Run the relevant checks from `package.json` (e.g. `npm run lint`, `npm run build`) before finishing code changes.
