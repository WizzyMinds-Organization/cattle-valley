import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { timedFetch } from '@/lib/timed-fetch';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: timedFetch(8000) },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const toLogin = (params: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    return NextResponse.redirect(url);
  };

  // Verify the session and read its claims. getClaims() checks the JWT
  // signature (locally when the project uses asymmetric signing keys,
  // otherwise one call to the auth server) and returns the decoded
  // payload — including the `user_role` claim added by the
  // custom_access_token_hook.
  let claims: Record<string, unknown> | null;
  try {
    const { data } = await supabase.auth.getClaims();
    claims = data?.claims ?? null;
  } catch {
    // Auth service slow or unreachable. Don't hang the page and don't
    // hard-lock a valid admin over a transient blip — let the request
    // through; the API routes (requireAdmin) are the real security
    // boundary and re-check on every write.
    return response;
  }

  if (!claims?.sub) return toLogin({ next: request.nextUrl.pathname });

  // Fast path: role is in the token.
  let role = typeof claims.user_role === 'string' ? claims.user_role : null;

  // Fallback: token predates the hook being enabled — look it up once.
  if (role === null) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', claims.sub as string)
        .single();
      role = profile?.role ?? null;
    } catch {
      return response; // transient DB blip — let it through, API enforces
    }
  }

  if (role !== 'admin') return toLogin({ error: 'not-authorized' });

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
