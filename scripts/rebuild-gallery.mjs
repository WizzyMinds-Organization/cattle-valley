// One-off: wipe the public gallery + investor gallery, re-seed the public
// gallery from the 22 curated farm/inauguration photos, point the hero and
// the 5 blog posts at working images, and clear investor_gallery_images.
//
//   node scripts/rebuild-gallery.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
// Local source images live in scratchpad/gimg + scratchpad/blogimg (already
// downloaded + converted to webp from the shared Google Photos albums).

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const BUCKET = 'media';

function readEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}
const env = { ...readEnvLocal(), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const role = JSON.parse(Buffer.from(SERVICE_KEY.split('.')[1], 'base64').toString()).role;
if (role !== 'service_role') { console.error('key role is', role, '- need service_role'); process.exit(1); }
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const GIMG = path.join(ROOT, 'scratchpad/gimg');
const BIMG = path.join(ROOT, 'scratchpad/blogimg');

// [curated file index, title, category, slug]
const GALLERY = [
  [ 1, 'The Cattle Valley farm entrance',            'Facilities',   'farm-entrance'],
  [ 2, 'Farm gatehouse',                             'Facilities',   'farm-gatehouse'],
  [ 3, 'Graze Valley — Healthy Living Habitat',      'Facilities',   'signboard'],
  [ 4, 'The farm township',                          'Facilities',   'farm-township'],
  [ 5, 'Farm roads and guest cottages',              'Facilities',   'farm-roads'],
  [ 0, 'Livestock sheds at the farm',                'Facilities',   'sheds-exterior'],
  [ 8, 'Cottages below the Western Ghats',           'The habitat',  'ghats-cottages'],
  [ 9, 'Landscaped grounds and guest cottages',      'The habitat',  'landscaped-grounds'],
  [ 6, 'Inside the livestock shed',                  'Livestock',    'shed-interior'],
  [ 7, 'Visitors at the goat pens',                  'Livestock',    'goat-pens'],
  [10, 'A family tours the shed',                    'Livestock',    'family-tour'],
  [11, 'Officials at the grand inauguration',        'Inauguration', 'inauguration-officials'],
  [13, 'The inauguration marquee',                   'Inauguration', 'inauguration-marquee'],
  [14, 'The inauguration gathering',                 'Inauguration', 'inauguration-gathering'],
  [15, 'Inaugural address',                          'Inauguration', 'inaugural-address-1'],
  [17, 'Inaugural address',                          'Inauguration', 'inaugural-address-2'],
  [18, 'Inaugural address',                          'Inauguration', 'inaugural-address-3'],
  [19, 'Inaugural address',                          'Inauguration', 'inaugural-address-4'],
  [16, 'The inauguration plaque unveiled',           'Inauguration', 'inauguration-plaque'],
  [12, 'A guest at the inauguration',                'Inauguration', 'inauguration-guest'],
  [20, 'Inauguration group photograph',              'Inauguration', 'inauguration-group-1'],
  [21, 'Inauguration group photograph',              'Inauguration', 'inauguration-group-2'],
];

// blog title (substring match) -> local webp under scratchpad/blogimg
const BLOG_IMAGES = [
  ['scientific stall-feeding', 'stall-feeding.webp'],
  ['a day in the life',        'day-in-life.webp'],
  ['Traceability',             'traceability.webp'],
  ['responsible breeding',     'breeding.webp'],
  ['future of sustainable',    'future-local.webp'],
];

async function uploadWebp(absPath) {
  const buf = readFileSync(absPath);
  const key = `${crypto.randomUUID()}.webp`;
  const { error } = await sb.storage.from(BUCKET).upload(key, buf, { contentType: 'image/webp' });
  if (error) throw error;
  return sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}

// ---- 0. snapshot what we're about to remove --------------------------
const { data: oldRows } = await sb.from('gallery_images').select('id,image_url');
const oldKeys = (oldRows || [])
  .map(r => (r.image_url || '').match(/\/media\/([^/?]+)$/)?.[1])
  .filter(Boolean);
console.log(`gallery_images: ${oldRows?.length ?? 0} rows, ${oldKeys.length} own storage objects to delete`);

// ---- 1. wipe public gallery rows ------------------------------------
{
  const { error } = await sb.from('gallery_images').delete().not('id', 'is', null);
  if (error) throw error;
  console.log('deleted all gallery_images rows');
}

// ---- 2. wipe investor gallery images ------------------------------
{
  const { data: iv } = await sb.from('investor_gallery_images').select('id,image_url');
  const ivKeys = (iv || []).map(r => (r.image_url || '').match(/\/media\/([^/?]+)$/)?.[1]).filter(Boolean);
  const { error } = await sb.from('investor_gallery_images').delete().not('id', 'is', null);
  if (error) throw error;
  console.log(`deleted all investor_gallery_images rows (${iv?.length ?? 0}); ${ivKeys.length} storage objects`);
  if (ivKeys.length) await sb.storage.from(BUCKET).remove(ivKeys);
}

// ---- 3. re-seed public gallery -----------------------------------
let order = 1;
for (const [idx, title, category, slug] of GALLERY) {
  const file = path.join(GIMG, `curated-${String(idx).padStart(2, '0')}.webp`);
  if (!existsSync(file)) { console.error('MISSING', file); process.exit(1); }
  const url = await uploadWebp(file);
  const { error } = await sb.from('gallery_images').insert({
    title, category, tags: [category], slug, image_url: url, sort_order: order,
  });
  if (error) throw error;
  console.log(`  + [${order}] ${category.padEnd(12)} ${title}`);
  order++;
}

// ---- 4. hero image --------------------------------------------------
{
  const url = await uploadWebp(path.join(GIMG, 'special-hero.webp'));
  const { error } = await sb.from('site_settings').update({ hero_image_url: url }).eq('id', 1);
  if (error) throw error;
  console.log('hero_image_url ->', url);
}

// ---- 5. blog post images -----------------------------------------
{
  const { data: posts } = await sb.from('blog_posts').select('id,title');
  for (const [needle, fname] of BLOG_IMAGES) {
    const post = posts.find(p => p.title.toLowerCase().includes(needle.toLowerCase()));
    if (!post) { console.error('no blog post matches', needle); continue; }
    const url = await uploadWebp(path.join(BIMG, fname));
    const { error } = await sb.from('blog_posts').update({ image_url: url }).eq('id', post.id);
    if (error) throw error;
    console.log(`  blog "${post.title}" -> ${fname}`);
  }
}

// ---- 6. delete the old gallery storage objects -----------------
if (oldKeys.length) {
  const { data, error } = await sb.storage.from(BUCKET).remove(oldKeys);
  if (error) console.error('storage remove error', error);
  else console.log(`removed ${data.length} old storage objects`);
}

// ---- 7. verify ---------------------------------------------------
const g = await sb.from('gallery_images').select('title,category,sort_order,image_url').order('sort_order');
const s = await sb.from('site_settings').select('hero_image_url').eq('id', 1).single();
const b = await sb.from('blog_posts').select('title,status,image_url').order('created_at');
const iv = await sb.from('investor_gallery_images').select('id');
const bucket = await sb.storage.from(BUCKET).list('', { limit: 1000 });
console.log('\n==== AFTER ====');
console.log('gallery_images:', g.data.length, '| categories:', [...new Set(g.data.map(r => r.category))].join(', '));
console.log('investor_gallery_images:', iv.data.length);
console.log('media bucket objects:', bucket.data.length);
console.log('hero:', s.data.hero_image_url);
console.log('blogs:');
b.data.forEach(r => console.log('  ', r.status.padEnd(9), r.title, '\n     ', r.image_url));

// reachability check
async function head(u) { try { const r = await fetch(u, { method: 'GET' }); return `${r.status} ${r.headers.get('content-type')}`; } catch (e) { return 'ERR ' + e.message; } }
console.log('\nreachability:');
console.log('  hero      ', await head(s.data.hero_image_url));
console.log('  gallery[0]', await head(g.data[0].image_url));
console.log('  gallery[-1]', await head(g.data[g.data.length - 1].image_url));
for (const r of b.data) console.log('  blog img  ', await head(r.image_url));
