-- Admin auth: run this once in the Supabase SQL editor, after schema.sql.
-- Safe to re-run.

-- Every auth user gets a profile row. New profiles default to the LEAST
-- privileged role ('investor') — admin access must be granted explicitly
-- below, it is never the default for a new sign-in.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'investor' check (role in ('admin', 'investor')),
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read their own profile" on public.profiles;
create policy "Users read their own profile" on public.profiles
  for select using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created (e.g. via
-- Dashboard -> Authentication -> Invite user, or the admin API).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Server-side helper for checking whether the current session belongs to
-- an admin. Used by API routes and, if needed later, RLS policies.
create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable set search_path = public;

-- -----------------------------------------------------------------------
-- Promote your admins. Run this AFTER inviting them (dashboard invite, or
-- the invite script), so their auth.users / profiles rows already exist.
-- Replace the emails below with the real admin emails.
-- -----------------------------------------------------------------------
-- update public.profiles set role = 'admin'
-- where id in (select id from auth.users where email in (
--   'you@example.com',
--   'client-admin-1@example.com',
--   'client-admin-2@example.com'
-- ));
