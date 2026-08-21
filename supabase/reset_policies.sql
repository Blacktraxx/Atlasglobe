-- Run this FIRST, by itself, before re-running schema.sql.
-- It drops every existing policy on these tables (whatever their names are),
-- so schema.sql can create them fresh with no "already exists" conflicts.

do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'transactions', 'support_messages', 'applications', 'page_visits')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;
