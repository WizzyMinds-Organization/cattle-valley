-- Investor gallery: separate, footer-only gallery with a managed category
-- list and a "date the batch was uploaded" field for URL-driven filtering.
-- Run once against the live Supabase project's SQL editor.

create table if not exists public.investor_gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.investor_gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  category text not null,
  taken_on date not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.investor_gallery_images;
create trigger set_updated_at before update on public.investor_gallery_images
  for each row execute function public.set_updated_at();

alter table public.investor_gallery_categories enable row level security;
alter table public.investor_gallery_images enable row level security;

drop policy if exists "Public read investor_gallery_categories" on public.investor_gallery_categories;
create policy "Public read investor_gallery_categories" on public.investor_gallery_categories for select using (true);

drop policy if exists "Public read investor_gallery_images" on public.investor_gallery_images;
create policy "Public read investor_gallery_images" on public.investor_gallery_images for select using (true);
