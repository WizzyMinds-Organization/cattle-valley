import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cookie-backed (not localStorage) so the session is visible to
// middleware and server-side route handlers, not just this tab.
export const supabase = createBrowserClient(url, anonKey);
