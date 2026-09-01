import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { timedFetch } from '@/lib/timed-fetch';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Session-aware client for Server Components and Route Handlers — reads
// the caller's auth cookie, so RLS/`auth.uid()` see the real signed-in
// user. Use this (not supabaseAdmin) whenever you need to know *who* is
// asking, not just bypass RLS.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    global: { fetch: timedFetch(8000) },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render; middleware refreshes the session cookie instead.
        }
      },
    },
  });
}
