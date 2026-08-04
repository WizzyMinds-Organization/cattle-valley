import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File must be 10 MB or smaller.' }, { status: 400 });

  const extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
  const path = `${crypto.randomUUID()}${extension}`;

  const { error } = await supabaseAdmin.storage.from('media').upload(path, file, { contentType: file.type || undefined });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data } = supabaseAdmin.storage.from('media').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, name: file.name, size: file.size });
}
