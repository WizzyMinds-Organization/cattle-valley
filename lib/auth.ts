import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Returns the signed-in admin's user id, or null if there is no session
// or the session isn't an admin. Call this at the top of every write-path
// API route — the middleware gate on /admin protects the page, but the
// API routes themselves are the actual security boundary since they can
// be called directly regardless of what page you're on.
export async function requireAdmin(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin' ? user.id : null;
}
