import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Returns the signed-in admin's user id, or null if there is no session
// or the session isn't an admin. Call this at the top of every write-path
// API route — the middleware gate on /admin protects the page, but the
// API routes themselves are the actual security boundary since they can
// be called directly regardless of what page you're on.
//
// Fast path reads the `user_role` claim baked into the JWT by
// custom_access_token_hook; falls back to the profiles table when the
// claim is absent (token minted before the hook was enabled).
export async function requireAdmin(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const userId = typeof claims?.sub === 'string' ? claims.sub : null;
  if (!userId) return null;

  let role = typeof claims?.user_role === 'string' ? claims.user_role : null;
  if (role === null) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    role = profile?.role ?? null;
  }

  return role === 'admin' ? userId : null;
}
