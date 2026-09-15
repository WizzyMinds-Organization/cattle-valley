import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { name?: string; email?: string; message?: string } | null;
  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const message = body?.message?.trim();
  if (!name || !email || !message) return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });

  const { error } = await supabaseAdmin.from('contact_submissions').insert({ name, email, message });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const webhookUrl = process.env.CONTACT_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, message, submittedAt: new Date().toISOString() }), signal: controller.signal });
    } catch (err) {
      console.error('contact sheet webhook failed', err);
    } finally {
      clearTimeout(timer);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  const { data, error } = await supabaseAdmin.from('contact_submissions').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
