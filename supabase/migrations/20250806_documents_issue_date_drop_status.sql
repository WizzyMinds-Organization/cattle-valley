-- Documents: add an issue date, drop the status field (documents go live
-- immediately on upload now).
-- Run once against the live Supabase project's SQL editor.

alter table public.documents add column if not exists issue_date date;

alter table public.documents drop constraint if exists documents_status_check;
alter table public.documents alter column status drop not null;
alter table public.documents alter column status drop default;
alter table public.documents drop column if exists status;
