// One-off: push the inauguration + farm photos into the Supabase gallery.
//
//   1. Get the real service_role key from Supabase dashboard
//      -> Project Settings -> API -> "service_role" (secret) key.
//   2. Run from the project root:
//
//        SUPABASE_SERVICE_ROLE_KEY="paste-the-key" node scripts/seed-gallery.mjs
//
// It reads NEXT_PUBLIC_SUPABASE_URL from .env.local, uploads each webp in
// public/images/gallery/ to the "media" storage bucket, and inserts a row
// in gallery_images. Safe to re-run: rows are keyed by `slug` (the file
// basename) and already-seeded images are skipped.

import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const IMG_DIR = path.join(ROOT, 'public/images/gallery');
const BUCKET = 'media';

// --- read env -------------------------------------------------------------
function readEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  const out = {};
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}
const env = { ...readEnvLocal(), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || /placeholder|replace/i.test(SERVICE_KEY)) {
  console.error('\nMissing config. Run as:\n  SUPABASE_SERVICE_ROLE_KEY="<real key>" node scripts/seed-gallery.mjs\n');
  process.exit(1);
}

// Quick sanity check: the key must decode to role "service_role".
try {
  const role = JSON.parse(Buffer.from(SERVICE_KEY.split('.')[1], 'base64').toString()).role;
  if (role !== 'service_role') {
    console.error(`\nThat key has role "${role}", not "service_role". Grab the service_role (secret) key from Supabase -> Project Settings -> API.\n`);
    process.exit(1);
  }
} catch { /* not a JWT we can read; let the API calls fail loudly instead */ }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// --- what to seed -------------------------------------------------------
// [file basename (also the dedupe slug), title, tag/category, sort order]
const IMAGES = [
  ['inauguration-group-photo',    'Officials at the grand inauguration',      'Inauguration',  1],
  ['inauguration-address-01',     'Inaugural address',                        'Inauguration',  2],
  ['inauguration-address-02',     'Inaugural address',                        'Inauguration',  3],
  ['inauguration-address-03',     'Inaugural address',                        'Inauguration',  4],
  ['inauguration-address-04',     'Inaugural address',                        'Inauguration',  5],
  ['inauguration-audience',       'The inauguration gathering',               'Inauguration',  6],
  ['inauguration-guest-portrait', 'A guest at the inauguration',              'Inauguration',  7],
  ['guests-arriving',             'Visitors on inauguration day',             'Inauguration',  8],
  ['arrival-walk',                'Guests arriving at the farm',              'The habitat',   9],
  ['western-ghats-sky',           'Monsoon sky over the Western Ghats',       'The habitat',  10],
  ['cottages-ghats',              'Farm cottages below the Western Ghats',    'Facilities',   11],
  ['cottages-grounds',            'Landscaped grounds and guest cottages',    'Facilities',   12],
  ['reception-building',          'The reception building',                   'Facilities',   13],
  ['farm-street-view',            'The farm township',                       'Facilities',   14],
  ['goat-shed-visit-01',          'Inside the goat shed',                     'Livestock',    15],
  ['goat-shed-visit-02',          'Discussing herd management',               'Livestock',    16],
];

async function insertRow(payload) {
  let { error } = await supabase.from('gallery_images').insert(payload);
  if (error && /sort_order/.test(error.message)) {
    const { sort_order, ...rest } = payload;
    ({ error } = await supabase.from('gallery_images').insert(rest));
  }
  if (error) throw error;
}

let added = 0, skipped = 0;
for (const [base, title, tag, order] of IMAGES) {
  const slug = base;
  const { data: existing } = await supabase.from('gallery_images').select('id').eq('slug', slug).limit(1);
  if (existing && existing.length) { console.log(`skip  ${base} (already seeded)`); skipped++; continue; }

  const buf = await readFile(path.join(IMG_DIR, `${base}.webp`));
  const key = `${crypto.randomUUID()}.webp`;
  const up = await supabase.storage.from(BUCKET).upload(key, buf, { contentType: 'image/webp' });
  if (up.error) { console.error(`FAIL upload ${base}: ${up.error.message}`); continue; }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
  try {
    await insertRow({ title, category: tag, tags: [tag], slug, image_url: pub.publicUrl, sort_order: order });
    console.log(`add   ${base}  ->  ${tag}`);
    added++;
  } catch (e) {
    console.error(`FAIL insert ${base}: ${e.message}`);
    await supabase.storage.from(BUCKET).remove([key]);
  }
}

console.log(`\ndone — ${added} added, ${skipped} skipped.`);
