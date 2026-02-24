-- Run this in the Supabase SQL editor to create the referrals table.
-- Filtering by user_id is done in the app (Clerk userId).

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  full_name text not null,
  job_title text not null,
  company_name text not null,
  company_website text not null,
  email text not null,
  phone text not null,
  relationship text not null,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'in_conversation', 'converted')),
  created_at timestamptz not null default now()
);

create index if not exists idx_referrals_user_id on public.referrals (user_id);
create index if not exists idx_referrals_created_at on public.referrals (created_at desc);
