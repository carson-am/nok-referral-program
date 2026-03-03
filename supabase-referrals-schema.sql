-- Run this in the Supabase SQL editor to create the referrals table.
-- Filtering by user_id is done in the app (Clerk userId).

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  full_name text not null,
  partner_name text not null,
  contact_email text not null,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'in_conversation', 'converted')),
  monday_item_id text,
  monday_status text,
  created_at timestamptz not null default now()
);

create index if not exists idx_referrals_user_id on public.referrals (user_id);
create index if not exists idx_referrals_created_at on public.referrals (created_at desc);

-- User signatures (agreement acceptance at sign-up)
create table if not exists public.user_signatures (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  full_name text not null,
  company_name text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_user_signatures_user_id on public.user_signatures (user_id);

-- If user_signatures was created without UNIQUE on user_id, run this so upsert(onConflict: 'user_id') works:
-- alter table public.user_signatures add constraint user_signatures_user_id_key unique (user_id);
