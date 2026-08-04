-- Hubs: add Google Maps link + separate contact number, drop the status field
-- (auction "upcoming"/"past" is now computed from auction_date instead).
-- Run once against the live Supabase project's SQL editor.

alter table public.hubs add column if not exists maps_url text;
alter table public.hubs add column if not exists contact_number text;

alter table public.hubs drop constraint if exists hubs_status_check;
alter table public.hubs alter column status drop not null;
alter table public.hubs alter column status drop default;
alter table public.hubs drop column if exists status;
