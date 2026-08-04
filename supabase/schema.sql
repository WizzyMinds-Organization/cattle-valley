-- Graze Valley CMS schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Hubs & auctions
-- ---------------------------------------------------------------------------
create table if not exists public.hubs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  description text not null default '',
  auction_date date,
  whatsapp text,
  status text not null default 'Upcoming' check (status in ('Active', 'Upcoming', 'Draft')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Blog posts
-- ---------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subheading text,
  content text,
  category text,
  read_time text,
  image_url text,
  status text not null default 'Draft' check (status in ('Draft', 'Published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Gallery images
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  tags text[] not null default '{}',
  slug text,
  image_url text,
  status text not null default 'Draft' check (status in ('Draft', 'Published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Testimonials
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text,
  status text not null default 'Published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  file_name text,
  file_url text,
  file_size bigint,
  status text not null default 'Draft' check (status in ('Draft', 'Published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Site settings (single row)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'Graze Valley',
  email text,
  phone text,
  address text,
  hero_image_url text,
  youtube_url text,
  instagram_url text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- updated_at auto-touch trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.hubs;
create trigger set_updated_at before update on public.hubs
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.blog_posts;
create trigger set_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.gallery_images;
create trigger set_updated_at before update on public.gallery_images
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.testimonials;
create trigger set_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.documents;
create trigger set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.site_settings;
create trigger set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The public site reads directly with the anon key, so SELECT is open to
-- everyone. There is no login on /admin yet, so INSERT/UPDATE/DELETE are
-- intentionally left to the service_role key only (used server-side from
-- Next.js API routes) — the anon key cannot write. Add real admin auth
-- before exposing writes to the anon key.
-- ---------------------------------------------------------------------------
alter table public.hubs enable row level security;
alter table public.blog_posts enable row level security;
alter table public.gallery_images enable row level security;
alter table public.testimonials enable row level security;
alter table public.documents enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public read hubs" on public.hubs;
create policy "Public read hubs" on public.hubs for select using (true);

drop policy if exists "Public read blog_posts" on public.blog_posts;
create policy "Public read blog_posts" on public.blog_posts for select using (true);

drop policy if exists "Public read gallery_images" on public.gallery_images;
create policy "Public read gallery_images" on public.gallery_images for select using (true);

drop policy if exists "Public read testimonials" on public.testimonials;
create policy "Public read testimonials" on public.testimonials for select using (true);

drop policy if exists "Public read documents" on public.documents;
create policy "Public read documents" on public.documents for select using (true);

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings" on public.site_settings for select using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded photos/documents
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Public read media" on storage.objects;
create policy "Public read media" on storage.objects
  for select using (bucket_id = 'media');

-- No anon insert/update/delete policy on storage.objects: uploads must go
-- through a server route using the service_role key, same reasoning as above.
