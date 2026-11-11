-- Hitmigo admin authorization draft. REVIEW before executing in Supabase SQL Editor.
-- Does not grant an admin role to anyone and does not alter existing ads policies.
begin;
create table if not exists public.hitmigo_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.hitmigo_admins enable row level security;
revoke all on table public.hitmigo_admins from anon, authenticated;
-- This SECURITY DEFINER function reveals only whether the caller is an admin.
-- Keep search_path fixed; never accept a user ID from the browser.
create or replace function public.is_hitmigo_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from public.hitmigo_admins a where a.user_id = auth.uid()
  );
$$;
revoke all on function public.is_hitmigo_admin() from public, anon;
grant execute on function public.is_hitmigo_admin() to authenticated;
commit;

-- MANUAL, AFTER VERIFYING THE OWNER'S auth.users UUID IN SUPABASE:
-- insert into public.hitmigo_admins(user_id) values ('OWNER-UUID-HERE');
-- Do not use email-based matching or client-side role checks as authorization.
-- IMPORTANT: Existing ads RLS must be audited before adding admin write policies.
