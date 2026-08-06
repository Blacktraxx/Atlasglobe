-- Prime Global Pay — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
-- Replaces the Base44 entity definitions previously in base44/entities/*.jsonc.

-- ============================================================================
-- profiles  (replaces base44 "User" entity's custom fields)
-- One row per auth.users row, created automatically on sign up via trigger.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  balance numeric not null default 0,
  account_number text unique,
  currency text not null default 'USD',
  phone text,
  address text,
  date_of_birth date,
  country text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Balance and role must never be settable by a direct client-side UPDATE —
-- otherwise any signed-in user could open dev tools and PATCH their own
-- balance or promote themselves to admin. Column-level privileges enforce
-- this at the database level regardless of what the client sends: balance
-- only ever changes inside the SECURITY DEFINER functions below (transfers,
-- simulated deposits/withdrawals), and role is only ever set by the
-- new-user trigger.
revoke update on public.profiles from authenticated;
grant update (full_name, phone, address, country, currency, date_of_birth) on public.profiles to authenticated;

-- The designated admin account can view every user's profile (needed for
-- the admin panel's user list). Regular users still only see their own row.
create policy "Admin can view all profiles"
  on public.profiles for select
  using ((auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

-- ============================================================================
-- transactions  (replaces base44 "Transaction" entity)
-- ============================================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipient_name text not null,
  recipient_email text,
  amount numeric not null,
  currency text not null default 'USD',
  fee numeric not null default 0,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  type text not null default 'transfer' check (type in ('transfer', 'deposit', 'withdrawal', 'exchange')),
  note text,
  reference text,
  created_date timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can create their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Admin can view all transactions"
  on public.transactions for select
  using ((auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

-- ============================================================================
-- support_messages  (replaces base44 "SupportMessage" entity)
-- ============================================================================
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;

create policy "Users can view their own support messages"
  on public.support_messages for select
  using (auth.uid() = user_id);

create policy "Users can create support messages"
  on public.support_messages for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Admin can view all support messages"
  on public.support_messages for select
  using ((auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

-- ============================================================================
-- applications  (demo intake forms: loan, credit card, tax filing)
-- Free-form fields live in `payload` so each form type can collect whatever
-- it needs without a schema migration per form. This is a demo/sample
-- feature — submissions just record intent, there is no payment step.
-- ============================================================================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('loan', 'credit_card', 'tax_filing')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('submitted', 'in_review', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.applications enable row level security;

create policy "Users can view their own applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "Users can create their own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "Admin can view all applications"
  on public.applications for select
  using ((auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

-- ============================================================================
-- Auto-create a profile row whenever a new user signs up (email/password only).
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, address, date_of_birth, account_number, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'address',
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date,
    'PGP' || to_char(now(), 'YYYYMMDD') || lpad((floor(random() * 10000))::text, 4, '0'),
    case when lower(new.email) = 'talonkahn1@gmail.com' then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- One-time backfill: if talonkahn1@gmail.com already signed up before this
-- migration ran, promote their existing profile to admin.
update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id and lower(u.email) = 'talonkahn1@gmail.com' and p.role <> 'admin';

-- ============================================================================
-- transfer_funds  — atomic peer-to-peer transfer by recipient account number.
-- Runs as SECURITY DEFINER so it can move balances between two profiles in
-- one transaction (the client's RLS policies only ever expose a user's own
-- row). Row locks (`for update`) prevent a race between two simultaneous
-- transfers touching the same balance.
-- ============================================================================
create or replace function public.transfer_funds(
  p_recipient_account_number text,
  p_amount numeric,
  p_note text default null
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_sender_id uuid := auth.uid();
  v_sender_balance numeric;
  v_sender_name text;
  v_recipient_id uuid;
  v_recipient_name text;
  v_reference text;
begin
  if v_sender_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  select balance, full_name into v_sender_balance, v_sender_name
  from public.profiles where id = v_sender_id for update;

  if v_sender_balance is null then
    raise exception 'Sender profile not found';
  end if;

  if v_sender_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  select id, full_name into v_recipient_id, v_recipient_name
  from public.profiles where account_number = p_recipient_account_number for update;

  if v_recipient_id is null then
    raise exception 'No account found with that account number';
  end if;

  if v_recipient_id = v_sender_id then
    raise exception 'You cannot transfer to your own account';
  end if;

  v_reference := 'TRF' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad((floor(random() * 100))::text, 2, '0');

  update public.profiles set balance = balance - p_amount where id = v_sender_id;
  update public.profiles set balance = balance + p_amount where id = v_recipient_id;

  insert into public.transactions (user_id, recipient_name, amount, currency, fee, status, type, note, reference)
  values (
    v_sender_id,
    coalesce(v_recipient_name, 'Atlas Globe user'),
    p_amount, 'USD', 0, 'completed', 'transfer', p_note, v_reference
  );

  insert into public.transactions (user_id, recipient_name, amount, currency, fee, status, type, note, reference)
  values (
    v_recipient_id,
    coalesce(v_sender_name, 'Atlas Globe user'),
    p_amount, 'USD', 0, 'completed', 'deposit',
    coalesce(p_note, 'Transfer from ' || coalesce(v_sender_name, 'an Atlas Globe user')),
    v_reference
  );

  return json_build_object('reference', v_reference, 'recipient_name', v_recipient_name);
end;
$$;

grant execute on function public.transfer_funds(text, numeric, text) to authenticated;

-- ============================================================================
-- lookup_account — lets a user preview the recipient's name before sending,
-- without exposing any other user's full profile (balance, etc.) via RLS.
-- ============================================================================
create or replace function public.lookup_account(p_account_number text)
returns table(full_name text)
language sql
security definer set search_path = public
as $$
  select full_name from public.profiles where account_number = p_account_number;
$$;

grant execute on function public.lookup_account(text) to authenticated;

-- ============================================================================
-- simulate_deposit / simulate_withdrawal — self-service demo balance changes.
-- These replace direct client-side `UPDATE profiles SET balance = ...` calls,
-- which would otherwise let any signed-in user set their own balance to
-- anything via the REST API. Both only ever touch the caller's own row.
-- ============================================================================
create or replace function public.simulate_deposit(p_amount numeric, p_note text default null)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_reference text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  v_reference := 'DEP' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad((floor(random() * 100))::text, 2, '0');

  update public.profiles set balance = balance + p_amount where id = v_user_id;

  insert into public.transactions (user_id, recipient_name, amount, currency, fee, status, type, note, reference)
  values (v_user_id, 'Account Deposit', p_amount, 'USD', 0, 'completed', 'deposit', p_note, v_reference);

  return json_build_object('reference', v_reference);
end;
$$;

grant execute on function public.simulate_deposit(numeric, text) to authenticated;

create or replace function public.simulate_withdrawal(p_amount numeric, p_destination text, p_note text default null)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_balance numeric;
  v_reference text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  select balance into v_balance from public.profiles where id = v_user_id for update;
  if v_balance is null then
    raise exception 'Profile not found';
  end if;
  if v_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  v_reference := 'WDR' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad((floor(random() * 100))::text, 2, '0');

  update public.profiles set balance = balance - p_amount where id = v_user_id;

  insert into public.transactions (user_id, recipient_name, amount, currency, fee, status, type, note, reference)
  values (v_user_id, coalesce(p_destination, 'External account'), p_amount, 'USD', 0, 'completed', 'withdrawal', p_note, v_reference);

  return json_build_object('reference', v_reference);
end;
$$;

grant execute on function public.simulate_withdrawal(numeric, text, text) to authenticated;

-- ============================================================================
-- page_visits — lightweight analytics for the admin dashboard. Anyone
-- (including signed-out visitors) can log a visit; only the admin can read
-- them back.
-- ============================================================================
create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  visitor_id text,
  user_id uuid references auth.users (id) on delete set null,
  referrer text,
  created_at timestamptz not null default now()
);

alter table public.page_visits enable row level security;

create policy "Anyone can log a visit"
  on public.page_visits for insert
  with check (true);

create policy "Admin can view all visits"
  on public.page_visits for select
  using ((auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

grant insert on public.page_visits to anon, authenticated;
grant select on public.page_visits to authenticated;

-- ============================================================================
-- admin_list_users — returns every user's profile plus their email (which
-- lives on auth.users, not public.profiles). Restricted to the admin email
-- inside the function itself, as a second layer behind the RLS policy above.
-- ============================================================================
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  account_number text,
  balance numeric,
  role text,
  country text,
  created_at timestamptz
)
language sql
security definer set search_path = public
as $$
  select p.id, u.email, p.full_name, p.account_number, p.balance, p.role, p.country, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where (auth.jwt() ->> 'email') = 'talonkahn1@gmail.com'
  order by p.created_at desc;
$$;

grant execute on function public.admin_list_users() to authenticated;
