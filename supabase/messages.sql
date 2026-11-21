-- Run in Supabase SQL editor before enabling messages.
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(),
 ad_id uuid not null references public.ads(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 body text not null check (char_length(trim(body)) between 1 and 2000),
 created_at timestamptz not null default now(),
 check (sender_id <> recipient_id)
);
create index if not exists messages_sender_idx on public.messages(sender_id,created_at desc);
create index if not exists messages_recipient_idx on public.messages(recipient_id,created_at desc);
alter table public.messages enable row level security;
revoke all on public.messages from anon;
grant select, insert on public.messages to authenticated;
drop policy if exists messages_participants_read on public.messages;
create policy messages_participants_read on public.messages for select to authenticated
using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists messages_sender_insert on public.messages;
create policy messages_sender_insert on public.messages for insert to authenticated
with check (
 auth.uid() = sender_id
 and sender_id <> recipient_id
 and exists (
   select 1 from public.ads a
   where a.id = ad_id and a.user_id = recipient_id
 )
);
-- IMPORTANT: This insert policy supports first contact with an ad owner only.
-- Replies from the ad owner need an additional policy verifying an existing conversation.
create policy messages_owner_reply on public.messages for insert to authenticated
with check (
 auth.uid() = sender_id and sender_id <> recipient_id
 and exists (
  select 1 from public.ads a where a.id = ad_id and a.user_id = sender_id
 )
 and exists (
  select 1 from public.messages m where m.ad_id = messages.ad_id
    and m.sender_id = messages.recipient_id and m.recipient_id = messages.sender_id
 )
);
