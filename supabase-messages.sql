-- PawPath Manila — private adopter <-> pet owner/reporter messaging. Run in Supabase SQL Editor. Safe to re-run.
-- Each message belongs to a conversation: (pet_id, adopter_id), with the pet's owner in owner_id.

alter table public.messages add column if not exists adopter_id uuid;
alter table public.messages add column if not exists owner_id uuid;

create index if not exists messages_pet_adopter_idx on public.messages (pet_id, adopter_id, created_at);
create index if not exists messages_owner_idx on public.messages (owner_id);
create index if not exists messages_adopter_idx on public.messages (adopter_id);

alter table public.messages enable row level security;

-- Replace the old "any signed-in user can read every message" policies with participant-only access.
drop policy if exists "Messages are viewable by authenticated users" on public.messages;
drop policy if exists "Authenticated users can send messages" on public.messages;
drop policy if exists "messages_select_participants" on public.messages;
drop policy if exists "messages_insert_participants" on public.messages;

create policy "messages_select_participants" on public.messages
  for select to authenticated
  using (adopter_id = auth.uid() or owner_id = auth.uid());

create policy "messages_insert_participants" on public.messages
  for insert to authenticated
  with check (
    (sender_role in ('adopter', 'system') and adopter_id = auth.uid())
    or (sender_role = 'coordinator' and owner_id = auth.uid())
  );

grant select, insert on public.messages to authenticated;

-- Realtime: new messages are pushed live to both people.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- Note: messages sent before this update have no adopter_id/owner_id, so they no longer appear in threads.
