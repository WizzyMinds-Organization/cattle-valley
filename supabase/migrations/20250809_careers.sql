-- Careers: new job_openings table for the Careers page + admin module.
-- Run once against the live Supabase project's SQL editor.

create table if not exists public.job_openings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text,
  location text,
  employment_type text,
  description text,
  status text not null default 'Draft' check (status in ('Draft', 'Published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.job_openings;
create trigger set_updated_at before update on public.job_openings
  for each row execute function public.set_updated_at();

alter table public.job_openings enable row level security;

drop policy if exists "Public read job_openings" on public.job_openings;
create policy "Public read job_openings" on public.job_openings for select using (true);
