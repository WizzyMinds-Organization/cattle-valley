// A `fetch` wrapper for the Supabase clients.
//
// Supabase sits behind Cloudflare; occasionally a request stalls during
// connection setup (edge hiccup, or a pile-up of token-refresh calls once
// the ~1h access token expires). With no ceiling the admin UI sits on a
// skeleton for 30s+. This aborts a stalled request after `timeoutMs` and
// retries it once on a fresh connection.
//
// Only idempotent GETs are guarded — token refreshes and writes (POST /
// PATCH / DELETE) are passed straight through so nothing is ever
// double-submitted.

export function timedFetch(timeoutMs = 12000): typeof fetch {
  const wrapped = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    const method = (init.method ?? 'GET').toUpperCase();
    if (method !== 'GET') return fetch(input as RequestInfo, init);

    let lastErr: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetch(input as RequestInfo, { ...init, signal: controller.signal });
      } catch (err) {
        lastErr = err;
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastErr;
  };
  return wrapped as typeof fetch;
}
