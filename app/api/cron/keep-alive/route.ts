import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Keep-alive ping for the Supabase project. The free tier pauses a
// project after ~7 days with no activity; this endpoint runs a trivial
// query so that never happens. Invoked by Vercel Cron (see vercel.json)
// four times a week.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  // Vercel Cron attaches `Authorization: Bearer <CRON_SECRET>` when the
  // CRON_SECRET env var is set. Reject everything else so the endpoint
  // can't be hammered from outside. If CRON_SECRET is not set yet the
  // check is skipped (add it in the Vercel project env vars).
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  const { error } = await supabaseAdmin.from('site_settings').select('id').limit(1);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ms: Date.now() - startedAt, at: new Date().toISOString() });
}
