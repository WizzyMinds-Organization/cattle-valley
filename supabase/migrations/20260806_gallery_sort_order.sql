-- Gallery: add a sort_order column so admins can drag-and-drop reorder
-- photos, and the public gallery paginates in that order instead of by date.
-- Run once against the live Supabase project's SQL editor.

alter table public.gallery_images add column if not exists sort_order integer;

-- Backfill existing rows so current (newest-first) order is preserved.
with ranked as (
  select id, row_number() over (order by created_at desc) - 1 as rn
  from public.gallery_images
)
update public.gallery_images
set sort_order = ranked.rn
from ranked
where public.gallery_images.id = ranked.id;

alter table public.gallery_images alter column sort_order set default 0;
create index if not exists gallery_images_sort_order_idx on public.gallery_images (sort_order);
