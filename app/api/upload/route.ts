import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth';

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 80;

// gif skipped to preserve animation; svg skipped since it's already tiny/vector
const COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File must be 10 MB or smaller.' }, { status: 400 });

  let body: Buffer | File = file;
  let contentType = file.type || undefined;
  let extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';

  if (COMPRESSIBLE_TYPES.has(file.type)) {
    const input = Buffer.from(await file.arrayBuffer());
    body = await sharp(input)
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    contentType = 'image/webp';
    extension = '.webp';
  }

  const path = `${crypto.randomUUID()}${extension}`;

  const { error } = await supabaseAdmin.storage.from('media').upload(path, body, { contentType });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data } = supabaseAdmin.storage.from('media').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, name: file.name, size: file.size });
}
