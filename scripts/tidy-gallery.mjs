// One-off cleanup after seed-gallery.mjs:
//  1. delete gallery_images rows that point at external placeholder hosts
//     (picsum.photos / images.unsplash.com) — the app's demo seed data.
//  2. lowercase category + tags on the 16 freshly-seeded rows so they
//     merge with the existing lowercase categories instead of making
//     duplicate filter buttons. "The habitat" -> "habitat".
//  3. renumber the surviving pre-existing rows to sit after the new 1..16.
//  4. delete every investor_gallery_images row (all are placeholders).
//     investor_gallery_categories are left intact.
//
//   SUPABASE_SERVICE_ROLE_KEY="<real key>" node scripts/tidy-gallery.mjs

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
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
if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing SUPABASE_URL / SERVICE key'); process.exit(1); }
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const isPlaceholder = u => /picsum\.photos|images\.unsplash\.com/.test(u || '');
const CASE_MAP = { 'Inauguration': 'inauguration', 'Facilities': 'facilities', 'Livestock': 'livestock', 'The habitat': 'habitat' };

// ---- 1 + 2 + 3: public gallery -----------------------------------------
{
  const { data: rows, error } = await sb.from('gallery_images').select('*');
  if (error) throw error;

  const dummies = rows.filter(r => isPlaceholder(r.image_url));
  const seeded  = rows.filter(r => r.category in CASE_MAP);
  const keep    = rows.filter(r => !isPlaceholder(r.image_url) && !(r.category in CASE_MAP));

  console.log(`gallery_images: ${rows.length} total -> delete ${dummies.length} placeholder, recase ${seeded.length} seeded, renumber ${keep.length} kept`);

  for (const r of dummies) {
    const { error: e } = await sb.from('gallery_images').delete().eq('id', r.id);
    console.log(`  del  "${r.title}"  ${e ? 'ERR ' + e.message : 'ok'}`);
  }
  for (const r of seeded) {
    const cat = CASE_MAP[r.category];
    const { error: e } = await sb.from('gallery_images').update({ category: cat, tags: [cat] }).eq('id', r.id);
    console.log(`  case "${r.title}"  ${r.category} -> ${cat}  ${e ? 'ERR ' + e.message : 'ok'}`);
  }
  // kept rows land at 17.. (new seeded rows already occupy 1..16)
  let n = 17;
  for (const r of keep.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    const { error: e } = await sb.from('gallery_images').update({ sort_order: n }).eq('id', r.id);
    console.log(`  ord  "${r.title}"  ${r.sort_order} -> ${n}  ${e ? 'ERR ' + e.message : 'ok'}`);
    n++;
  }
}

// ---- 4: investor gallery ----------------------------------------------
{
  const { data: rows, error } = await sb.from('investor_gallery_images').select('id,title,image_url');
  if (error) throw error;
  const dummies = rows.filter(r => isPlaceholder(r.image_url));
  const real = rows.length - dummies.length;
  console.log(`\ninvestor_gallery_images: ${rows.length} total -> delete ${dummies.length} placeholder${real ? `, keep ${real} real` : ''}`);
  for (const r of dummies) {
    const { error: e } = await sb.from('investor_gallery_images').delete().eq('id', r.id);
    if (e) console.log(`  del "${r.title}"  ERR ${e.message}`);
  }
  console.log(`  deleted ${dummies.length}`);
}

// ---- verify ----------------------------------------------------------
const g = await sb.from('gallery_images').select('title,category,sort_order').order('sort_order');
const iv = await sb.from('investor_gallery_images').select('id');
const ic = await sb.from('investor_gallery_categories').select('name');
console.log(`\nAFTER: gallery_images ${g.data.length}, investor_gallery_images ${iv.data.length}, investor_gallery_categories ${ic.data.length}`);
console.log('categories in gallery:', [...new Set(g.data.map(r => r.category))].join(', '));
