# Prime Global Pay

A React + Vite frontend backed by [Supabase](https://supabase.com) (auth + database) and deployed on [Vercel](https://vercel.com).

Authentication is email + password only (no social/Google login).

## Prerequisites

1. Clone the repository and `cd` into the project directory.
2. Install dependencies: `npm install`.
3. Create a [Supabase](https://supabase.com) project (free tier is fine).

## Set Up Supabase

1. In the Supabase dashboard, open **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates the `profiles`, `transactions`, and `support_messages` tables, their row-level security policies, and a trigger that provisions a profile row whenever a new user signs up.
2. In **Authentication -> Providers -> Email**, make sure **Email** is enabled, and turn **Confirm email OFF**. This app signs new users in immediately after registration, with no email verification step — if "Confirm email" is left on, Supabase won't return a session on sign-up and new accounts will be stuck waiting on a confirmation email instead of landing on the dashboard.
4. Under **Authentication -> URL Configuration**, add your local dev URL (e.g. `http://localhost:5173`) and your production Vercel URL to **Redirect URLs**, since password-reset emails link back to `/reset-password` on whichever origin sent the request.
5. Copy your **Project URL** and **anon public key** from **Project Settings -> API**.

## Local Development

Copy `.env.example` to `.env.local` and fill in your Supabase values:

```bash
cp .env.example .env.local
```

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Then start the dev server:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Deploy to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Vercel, **Add New Project** and import the repo. Vercel auto-detects the Vite build (`npm run build`, output directory `dist`) — no extra config is needed, but a `vercel.json` is included with a rewrite rule so client-side routes (like `/dashboard`) work on full page loads/refreshes.
3. In the Vercel project's **Settings -> Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Add the resulting `*.vercel.app` domain (and any custom domain) to Supabase's **Authentication -> URL Configuration -> Redirect URLs** so password reset links work in production.

## Project Structure

- `src/lib/supabaseClient.js` — Supabase browser client.
- `src/lib/AuthContext.jsx` — auth state (email/password sign-in, sign-up, sign-out, password reset).
- `src/lib/ThemeContext.jsx` — light/dark mode, toggled from the dashboard topbar and persisted in `localStorage`.
- `src/components/LanguageSwitcher.jsx` — page translation (Google's client-side website-translate widget), covering major Asian languages plus others.
- `src/api/entities.js` — data-access helpers for `profiles`, `transactions`, `support_messages`, and `applications`.
- `supabase/schema.sql` — database schema, RLS policies, and the new-user trigger.
- `src/pages/` — route-level pages (Login, Register, Dashboard, Transfer, Transactions, Cards, Contact, Loans, CreditCardApply, TaxFiling, Deposit, Receive, Withdraw, etc.).

## Admin panel

`talonkahn1@gmail.com` is the sole admin account — the role is assigned automatically by the sign-up trigger for that exact email (and backfilled for that account if it already existed before you ran the updated schema), and is enforced at the database level via `auth.jwt() ->> 'email'`, not by anything the client sends. Signed in as that email, a new **Admin Panel** link appears in the sidebar, linking to `/admin` (any other user hitting that URL is redirected straight back to `/dashboard`), with two tabs:

- **Users** — every signed-up user, their account number, role, balance, and join date. This is **view-only** — there is no "credit user" or balance-editing action here or anywhere else in the app. An admin able to arbitrarily inflate any user's balance is exactly the fake-balance mechanism real advance-fee scams use to look legitimate, so it's intentionally not part of this build.
- **Analytics** — page views and unique visitors (tracked via `src/components/VisitTracker.jsx`, which logs every route change to the `page_visits` table — including signed-out visitors on the landing page), a visits-per-day chart, and a top-pages breakdown.

### Balance security fix

Earlier versions of this app let the client directly `UPDATE profiles SET balance = ...`, which — since Supabase RLS only checked *whose row* was being written, not *which columns* — meant any signed-in user could open dev tools and set their own balance to anything via the REST API directly. This is now closed: `revoke update on public.profiles from authenticated` restricts direct client updates to safe profile fields only (name, phone, address, etc.), and every balance change (transfers, simulated deposits, simulated withdrawals) now goes through a `SECURITY DEFINER` Postgres function (`transfer_funds`, `simulate_deposit`, `simulate_withdrawal`) that validates the operation server-side. Re-run `supabase/schema.sql` to pick this up — it's a breaking change for any code still calling `Profiles.update({ balance })` directly (nothing in this codebase does anymore).

## Sending money between users

Users can send money to each other by entering the recipient's **account number** (shown on their Receive page). This runs through the `transfer_funds` Postgres function in `supabase/schema.sql`, which atomically debits the sender and credits the recipient in a single database transaction — this is real balance movement between two Supabase-backed accounts, not a simulation. Re-run the updated `schema.sql` in your Supabase project to pick up this function along with the `lookup_account` helper (used to preview the recipient's name before sending) and the new `address` / `date_of_birth` profile columns.

## Onboarding

Sign-up now collects full name, home address, and date of birth in addition to email/password. These are passed as auth user metadata and copied into the `profiles` table by the `handle_new_user` trigger. The account holder's name is what's shown on the dashboard's balance card.

## Crypto exchange rebrand

- **Connect a wallet**: on `/withdraw`, choosing ETH or USDT (ERC-20) shows MetaMask and Coinbase Wallet connect buttons; choosing SOL shows Phantom. These call the wallet's standard `eth_requestAccounts` / Solana `connect()` methods to read the public address only — no transaction or signature is ever requested — and auto-fill the wallet address field. `src/lib/walletConnect.js` has the connector logic; it degrades gracefully with an install-link error if the extension isn't present.
- **"Need help with this transaction?"** appears under every withdrawal row in `/transactions`, and links to `/contact` with the subject/message pre-filled with that transaction's reference — the same support destination (email + Telegram, via `src/components/SupportContact.jsx`) shown right after a withdrawal completes.

The app is branded as a crypto exchange: the landing page, dashboard, and withdrawal flow all frame the product as swapping a USD balance for BTC/ETH/SOL/USDT and withdrawing to an external wallet.

- `/withdraw` ("Swap & Withdraw") includes a **Crypto Wallet** method alongside Cash App, Venmo, Zelle, and Bank. Selecting it fetches a live market rate from [CoinGecko's public API](https://www.coingecko.com/en/api) (no key required) to show an estimated crypto amount for the USD entered — reference-only, since this app doesn't hold or move real crypto.
- The withdrawal confirmation screen and `/contact` both show a "Need help?" section with support contact info: `talonkahn1@gmail.com` and Telegram handle `@Talonkahn`, defined once in `src/components/SupportContact.jsx` and reused everywhere.
- As with the rest of the money-movement features here, withdrawals are simulated against the demo balance and complete immediately — there's no fee or deposit required to withdraw.

## Demo-only features

A few features in this app are intentionally sample/demo implementations rather than real financial integrations:

- **Loans, Credit Card, and Tax Filing** (`/loans`, `/credit-cards`, `/taxes`) are sample intake forms. Submissions are stored in the `applications` table for record-keeping; nothing is actually processed and there's no payment step.
- **Add Funds** (`/deposit`) shows placeholder crypto addresses and placeholder bank details, clearly labeled as demo. Clicking "Simulate deposit" credits the demo balance directly — no real money moves. To accept real deposits, integrate a licensed payment processor (e.g. Coinbase Commerce for crypto, or Plaid/Stripe/Dwolla for bank transfers/ACH) instead of using static wallet/account numbers.
- **Withdraw** (`/withdraw`) similarly simulates a withdrawal against the demo balance.
