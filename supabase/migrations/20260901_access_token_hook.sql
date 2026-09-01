-- Custom Access Token Hook: put the admin role into the JWT.
--
-- Why: route authorization (middleware + API routes) was doing a live
-- `select role from profiles` on every request. This bakes the role into
-- the access token as a `user_role` claim, refreshed automatically every
-- ~1h with the token, so the common path needs no database round-trip.
-- `public.profiles` stays the source of truth; the JWT carries a cached
-- copy. Code falls back to the profiles query when the claim is absent
-- (e.g. tokens minted before this hook was enabled), so it is safe to
-- deploy in any order.
--
-- Safe to re-run.
--
-- AFTER running this migration, enable the hook once in the dashboard:
--   Authentication -> Hooks -> "Customize Access Token (JWT) Claims"
--   -> enable -> choose  public.custom_access_token_hook
-- Existing sessions pick up the claim on their next token refresh
-- (within ~1h) or on next sign-in.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  found_role text;
begin
  select role into found_role
  from public.profiles
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', coalesce(to_jsonb(found_role), 'null'::jsonb));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- The Auth server (supabase_auth_admin) is the only caller of the hook.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

-- The hook reads profiles; give the Auth server read access + an RLS
-- policy so the lookup succeeds.
grant select on table public.profiles to supabase_auth_admin;

drop policy if exists "Auth admin reads roles for token hook" on public.profiles;
create policy "Auth admin reads roles for token hook"
  on public.profiles
  for select
  to supabase_auth_admin
  using (true);
