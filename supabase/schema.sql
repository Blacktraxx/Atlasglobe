-- Prime Global Pay — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
-- Replaces the Base44 entity definitions previously in base44/entities/*.jsonc.

-- ============================================================================
-- profiles  (replaces base44 "User" entity's custom fields)
-- One row per auth.users row, created automatically on sign up via trigger.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade
);

-- `create table if not exists` above is a no-op if the table already exists
-- from an earlier version of this schema — it will NOT add new columns to
-- an existing table. These guards backfill any column this schema expects
-- but an older deployment might be missing (this is what caused the
-- "column address does not exist" error).
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists balance numeric not null default 0;
alter table public.profiles add column if not exists account_number text;
alter table public.profiles add column if not exists currency text not null default 'USD';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists date_of_birth date;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

create unique index if not exists profiles_account_number_key on public.profiles (account_number);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
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
drop policy if exists "Admin can view all profiles" on public.profiles;
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

drop policy if exists "Users can view their own transactions" on public.transactions;
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own transactions" on public.transactions;
create policy "Users can create their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admin can view all transactions" on public.transactions;
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

drop policy if exists "Users can view their own support messages" on public.support_messages;
create policy "Users can view their own support messages"
  on public.support_messages for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create support messages" on public.support_messages;
create policy "Users can create support messages"
  on public.support_messages for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Admin can view all support messages" on public.support_messages;
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

drop policy if exists "Users can view their own applications" on public.applications;
create policy "Users can view their own applications"
  on public.applications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own applications" on public.applications;
create policy "Users can create their own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admin can view all applications" on public.applications;
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

drop policy if exists "Anyone can log a visit" on public.page_visits;
create policy "Anyone can log a visit"
  on public.page_visits for insert
  with check (true);

drop policy if exists "Admin can view all visits" on public.page_visits;
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

-- ============================================================================
-- products — the storefront catalog. Publicly readable (active items only);
-- only the admin email can create/edit/delete.
-- ============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  category text not null default 'basic' check (category in ('basic', 'standard', 'premium')),
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
create policy "Anyone can view active products"
  on public.products for select
  using (active = true or (auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

drop policy if exists "Admin can insert products" on public.products;
create policy "Admin can insert products"
  on public.products for insert
  with check ((auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

drop policy if exists "Admin can update products" on public.products;
create policy "Admin can update products"
  on public.products for update
  using ((auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can delete products"
  on public.products for delete
  using ((auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- ============================================================================
-- orders — guest checkout, paid by crypto. Rows are only ever written by the
-- SECURITY DEFINER functions below (never a direct client insert), which is
-- what lets an unauthenticated guest check out at all despite RLS, while
-- still computing the total server-side from real product prices instead of
-- trusting whatever the client sends.
-- ============================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  guest_name text not null,
  guest_email text not null,
  items jsonb not null,
  total numeric not null,
  crypto_asset text not null,
  wallet_address text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null
);

alter table public.orders add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.orders enable row level security;

drop policy if exists "Admin can view all orders" on public.orders;
create policy "Admin can view all orders"
  on public.orders for select
  using ((auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

grant select on public.orders to authenticated;

-- Demo merchant wallet addresses shown at checkout — placeholders, not real
-- addresses. Swap these for a real payment processor before accepting real
-- payments (see README).
create or replace function public.create_order(
  p_items jsonb, -- [{"product_id": "...", "qty": 2}, ...]
  p_guest_name text,
  p_guest_email text,
  p_crypto_asset text
)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  v_total numeric := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_order public.orders;
  v_reference text;
  v_wallet text;
  v_user_id uuid := auth.uid();
  v_line_items jsonb := '[]'::jsonb;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;
  if p_guest_name is null or length(trim(p_guest_name)) = 0 then
    raise exception 'Name is required';
  end if;
  if p_guest_email is null or length(trim(p_guest_email)) = 0 then
    raise exception 'Email is required';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where id = (v_item ->> 'product_id')::uuid and active = true;
    if v_product.id is null then
      raise exception 'One of the items in your cart is no longer available';
    end if;
    v_total := v_total + (v_product.price * greatest(coalesce((v_item ->> 'qty')::int, 1), 1));
    v_line_items := v_line_items || jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'qty', greatest(coalesce((v_item ->> 'qty')::int, 1), 1),
      'category', v_product.category
    );
  end loop;

  v_reference := 'ORD' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad((floor(random() * 100))::text, 2, '0');

  v_wallet := case p_crypto_asset
    when 'BTC' then 'bc1qdemo0000000000000000000000000sample'
    when 'ETH' then '0xDEMO0000000000000000000000000000SAMPLE'
    when 'SOL' then 'DEMoSampLE1111111111111111111111111111111'
    when 'USDT-ERC20' then '0xDEMO0000000000000000000000000000SAMPLE'
    when 'USDT-TRC20' then 'TDEM0Sample000000000000000000000000'
    else 'bc1qdemo0000000000000000000000000sample'
  end;

  insert into public.orders (reference, guest_name, guest_email, items, total, crypto_asset, wallet_address, status, expires_at, user_id)
  values (v_reference, trim(p_guest_name), trim(p_guest_email), v_line_items, v_total, p_crypto_asset, v_wallet, 'pending', now() + interval '5 minutes', v_user_id)
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function public.create_order(jsonb, text, text, text) to anon, authenticated;

-- Lets a guest (no auth) look up their own order by its reference — without
-- this, they'd have no way to see their order status since the table's RLS
-- only allows the admin to SELECT.
create or replace function public.get_order_by_reference(p_reference text)
returns setof public.orders
language sql
security definer set search_path = public
as $$
  select * from public.orders where reference = p_reference;
$$;

grant execute on function public.get_order_by_reference(text) to anon, authenticated;

-- Demo "I've sent payment" confirmation. Enforces the 5-minute window
-- server-side too, not just in the UI countdown.
create or replace function public.mark_order_paid(p_reference text)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where reference = p_reference for update;
  if v_order.id is null then
    raise exception 'Order not found';
  end if;
  if v_order.status = 'paid' then
    return v_order;
  end if;
  if now() > v_order.expires_at then
    update public.orders set status = 'expired' where id = v_order.id returning * into v_order;
    raise exception 'This payment window has expired. Please start a new checkout.';
  end if;
  update public.orders set status = 'paid' where id = v_order.id returning * into v_order;
  return v_order;
end;
$$;

grant execute on function public.mark_order_paid(text) to anon, authenticated;

-- ============================================================================
-- product-images storage bucket — for the admin's photo uploads on products.
-- Publicly readable (product photos need to load on the storefront for
-- anyone), only the admin email can upload/replace/delete.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admin can upload product images" on storage.objects;
create policy "Admin can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

drop policy if exists "Admin can update product images" on storage.objects;
create policy "Admin can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

drop policy if exists "Admin can delete product images" on storage.objects;
create policy "Admin can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'talonkahn1@gmail.com');

-- ============================================================================
-- Realtime — lets the admin's Analytics tab receive new page_visits rows
-- live, without polling or a manual refresh.
-- ============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'page_visits'
  ) then
    alter publication supabase_realtime add table public.page_visits;
  end if;
end $$;
