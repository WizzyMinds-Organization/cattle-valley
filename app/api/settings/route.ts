import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { settingsRowToItem, settingsItemToPayload, Settings } from '@/lib/cms';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  const body = (await req.json()) as Settings;
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .update(settingsItemToPayload(body))
    .eq('id', 1)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(settingsRowToItem(data));
}
