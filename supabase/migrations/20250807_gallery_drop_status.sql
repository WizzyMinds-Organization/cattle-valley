-- Gallery: drop the status field (images go live immediately on upload now).
-- Run once against the live Supabase project's SQL editor.

alter table public.gallery_images drop constraint if exists gallery_images_status_check;
alter table public.gallery_images alter column status drop not null;
alter table public.gallery_images alter column status drop default;
alter table public.gallery_images drop column if exists status;
