# Atlas Globe Shop

A small crypto-only e-commerce storefront: React + Vite frontend, [Supabase](https://supabase.com) for the database, deployed on [Vercel](https://vercel.com).

- **Guest or account checkout** — shoppers can check out with just a name and email, or create an account first so their orders show up in an order history. Either way, no account is required to buy.
- **Pay in crypto** — BTC, ETH, SOL, or USDT (ERC-20/TRC-20). Each order gets a payment address and a **5-minute window** (standard practice for crypto checkout, since a quoted price only holds while exchange rates are current).
- **One admin account** — `talonkahn1@gmail.com` is the only account with dashboard access, enforced at the database level, not just in the UI. Any other account is a regular shopper.
- **Reviews and support both go to Telegram** (`@blacktraxx`) — there's no in-app support form.

## Prerequisites

1. Clone the repository and `cd` into the project directory.
2. Install dependencies: `npm install`.
3. Create a [Supabase](https://supabase.com) project (free tier is fine).

## Set up Supabase

1. In the Supabase dashboard, open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql) in full. It creates:
   - `products` — the catalog (name, description, price, category, photo, active flag). Publicly readable when `active = true`; only the admin email can create/edit/delete. Photos are uploaded to the `product-images` Storage bucket (also created by this script) rather than pasted as URLs.
   - `orders` — guest *or* account orders. Rows are only ever written by the `create_order` function below — never a direct client insert — so the total is always computed server-side from real product prices, not whatever the client sends. If the shopper is signed in, their `user_id` is attached automatically so the order shows up in their account.
   - `page_visits` — pageview analytics for the admin dashboard, with Realtime enabled so new visits appear on the Analytics tab live, no refresh needed.
   - `profiles` — kept from an earlier version of this app; only used now to hold the admin's role flag.
   - Functions: `create_order` (computes total, issues a 5-minute expiry, returns a demo merchant wallet address), `get_order_by_reference` (lets a guest, with no login, check their own order status), `mark_order_paid` (the "I've sent payment" confirmation — also re-checks the 5-minute window server-side).
2. **This script is safe to re-run** any time you pull schema changes — every statement uses `if not exists` / `or replace` / a `drop ... if exists` guard, so re-running it won't error or touch existing data.
3. In **Authentication → Providers → Email**, make sure **Email** is enabled and **Confirm email** is off (the admin sign-in goes straight through, no email verification step).
4. Copy your **Project URL** and **anon public key** from **Project Settings → API**.

### Making yourself the admin

Sign up once through `/login` → "Create one" (or `/register` directly) using `talonkahn1@gmail.com`. The sign-up trigger in `schema.sql` automatically assigns that exact email the `admin` role — no manual step needed. If that email already had an account before you ran the schema, the script backfills it to admin automatically.

## Accounts vs. the admin dashboard

Anyone can create an account (`/register`) — it just gets them an order history at `/account` and prefilled checkout details next time. That's it; regular accounts have no special access.

`talonkahn1@gmail.com` is the one exception: signing in with that exact email redirects straight to `/admin` instead of the shop, and the nav shows a "Dashboard" link instead of "Account". This is enforced two ways — `Admin.jsx` checks the email client-side, and every admin-only table/function checks `auth.jwt() ->> 'email'` server-side — so it doesn't depend on anything the client sends.

## Local development

```bash
cp .env.example .env.local
```

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub/GitLab/Bitbucket and import the repo in Vercel — it auto-detects the Vite build. `vercel.json` includes the SPA rewrite needed for client-side routes like `/order/:reference`.
2. In **Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy.

## How checkout works

1. Shopper adds items to the cart (stored in `localStorage`, no account needed).
2. At `/checkout`, they enter a name, email, and pick a crypto asset, then submit.
3. `Orders.create()` calls the `create_order` Postgres function, which recomputes the total from the live `products` table, generates an order reference, picks a demo wallet address for the chosen asset, and sets a 5-minute expiry.
4. `/order/:reference` shows the address, amount, and a live countdown. Clicking "I've sent payment" calls `mark_order_paid`, which is rejected server-side if the window has passed — the UI countdown is a convenience, not the actual enforcement.
5. Every order page also links to Telegram (`@blacktraxx`) for help.

### This is demo-mode crypto, not a real payment integration

The wallet addresses in `create_order` (in `schema.sql`) are **placeholders**, not real addresses — swap them out is not enough to make this process real payments safely. To actually accept crypto, integrate a licensed payment processor (e.g. [Coinbase Commerce](https://commerce.coinbase.com), BTCPay Server) that generates a unique address per order and confirms on-chain payment automatically, rather than trusting a self-reported "I've sent payment" click.

## Admin panel

Signed in as `talonkahn1@gmail.com`, `/admin` has three tabs:

- **Products** — create, edit, delete, and categorize products (Basic / Standard / Premium), toggle active/hidden. Photos are uploaded directly (stored in Supabase Storage's `product-images` bucket) rather than pasted as a URL.
- **Orders** — every order (guest or account) and its status (pending / paid / expired).
- **Analytics** — page views, unique visitors, and a visits chart, tracked via `src/components/VisitTracker.jsx` on every route change (including signed-out shoppers). This updates **live** via Supabase Realtime (`Visits.subscribe()`) — new visits appear without a page refresh, shown by the pulsing "Live" indicator.

Any other signed-in account hitting `/admin` is redirected straight back to the shop — this is enforced both by React (`Admin.jsx` checks the email) and by Postgres RLS (`auth.jwt() ->> 'email'`), so it doesn't depend on anything the client sends.

## Design

The storefront uses a neobrutalist "indie hacker" look: warm cream background, bold black (or cream, in dark mode) 2px borders with hard offset drop-shadows on cards and buttons, a safety-orange accent, Space Grotesk for display type, and JetBrains Mono for prices and category tags. Tokens live in `src/index.css` (`--background`, `--primary`, etc.) and `index.html` (font imports).

## Project structure

- `src/lib/supabaseClient.js` — Supabase browser client.
- `src/lib/AuthContext.jsx` — sign-in for both regular accounts and the admin; which one you get is decided by email, not a separate flow.
- `src/lib/CartContext.jsx` — cart state, persisted to `localStorage`.
- `src/lib/ThemeContext.jsx` — light/dark mode toggle.
- `src/api/entities.js` — `Products` (incl. `uploadImage`), `Orders` (incl. `myOrders`), `Visits` (incl. `subscribe` for realtime), `Profiles` data-access helpers.
- `src/components/ProductCard.jsx`, `CartDrawer.jsx`, `StoreNav.jsx` — storefront UI.
- `src/components/DiceGame.jsx` — a free, stakes-free dice roller on the homepage.
- `src/pages/Home.jsx`, `Checkout.jsx`, `OrderStatus.jsx` — the shopper-facing flow.
- `src/pages/Account.jsx` — order history + logout for signed-in shoppers.
- `src/pages/Admin.jsx`, `src/components/AdminLayout.jsx` — the admin-only dashboard.
- `supabase/schema.sql` — full database schema, RLS policies, storage bucket, and checkout functions.
