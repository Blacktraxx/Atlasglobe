# AGENTS.md

## Project Context

Atlas Globe Shop — a crypto-only e-commerce storefront. React + Vite frontend, Supabase for the database, Vercel for hosting. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and the Supabase/Vercel deploy workflow.

Checkout is guest-only by design — shoppers never create accounts. The only authenticated account is the single admin (`talonkahn1@gmail.com`, enforced at the database level via `auth.jwt() ->> 'email'`, not just in the UI). Auth is email + password only — there is no social login anywhere in this app. Do not reintroduce it without an explicit request.

## Key Files

- `src/`: frontend application source.
- `src/lib/supabaseClient.js`: Supabase browser client (reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`).
- `src/lib/AuthContext.jsx`: admin sign-in only.
- `src/lib/CartContext.jsx`: cart state, persisted to `localStorage` (no server-side cart — checkout is guest-only).
- `src/lib/ThemeContext.jsx`: light/dark mode.
- `src/api/entities.js`: data-access helpers for `products`, `orders`, `page_visits`, and `profiles`. Add new tables/queries here rather than calling `supabase.from(...)` directly from pages.
- `supabase/schema.sql`: source of truth for the database schema, RLS policies, and the checkout functions (`create_order`, `get_order_by_reference`, `mark_order_paid`). Keep this file in sync with any schema changes — every statement must stay idempotent (`if not exists` / `or replace` / `drop ... if exists`) since it's meant to be safely re-run, and mention that the user needs to re-run it in the Supabase SQL editor after any change.
- `vercel.json`: SPA rewrite so client-side routes (like `/order/:reference`) resolve on Vercel.
- `.env.local`: local-only environment values; never commit secrets.

## Design system

Neobrutalist "indie hacker" look — cream background, bold 2px borders with hard offset drop-shadows, safety-orange accent, Space Grotesk (display) + JetBrains Mono (prices/tags). Tokens live in `src/index.css` and font imports in `index.html`. Keep new UI consistent with this rather than reaching for default shadcn styling.

## Working notes

- Never trust a client-supplied price or total. Order totals are computed server-side in `create_order` from the live `products` table — if you add new checkout-adjacent features (discounts, shipping, etc.), keep that computation server-side too.
- Any new entity/table needs: a table + RLS policies in `supabase/schema.sql`, and a corresponding helper in `src/api/entities.js`.
- Use `npm run dev` for local frontend development against your Supabase project (configured via `.env.local`).
- Deployment is via Vercel; environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set in the Vercel project settings, not committed to the repo.
- Run the relevant checks from `package.json` (e.g. `npm run lint`, `npm run build`) before finishing code changes.
