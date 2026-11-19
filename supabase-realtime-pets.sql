-- PawPath Manila — live pets + Realtime. Run in Supabase SQL Editor. Safe to re-run.
create extension if not exists "uuid-ossp";

-- 1) PETS TABLE (created if missing)
create table if not exists public.pets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  species text not null check (species in ('Dog','Cat','Other')),
  breed text not null,
  age_label text not null,
  status text not null default 'HEALTHY',
  health_status text not null default 'Healthy',
  health_conditions text[] not null default '{}',
  temperament_preferences text[] not null default '{}',
  adoption_stage text not null default 'Available',
  listing_type text not null default 'adoption',
  district text not null,
  barangay text not null,
  lat double precision not null,
  lng double precision not null,
  vaccinated boolean not null default false,
  medical_notes text,
  urgency_flags text[] default '{}',
  rehoming_reason text,
  reporter_name text not null,
  reporter_phone text,
  owner_id uuid,
  image_url text,
  created_at timestamptz not null default now()
);

-- 1b) ALTER an older pets table to match what the app writes
alter table public.pets add column if not exists health_status text not null default 'Healthy';
alter table public.pets add column if not exists health_conditions text[] not null default '{}';
alter table public.pets add column if not exists temperament_preferences text[] not null default '{}';
alter table public.pets add column if not exists urgency_flags text[] default '{}';
alter table public.pets add column if not exists rehoming_reason text;
alter table public.pets add column if not exists reporter_phone text;
alter table public.pets add column if not exists owner_id uuid;
alter table public.pets add column if not exists image_url text;

-- Constraints (rebuilt so 'Pending Coordinator Review' etc. are accepted)
alter table public.pets drop constraint if exists pets_status_check;
alter table public.pets drop constraint if exists pets_adoption_stage_check;
alter table public.pets drop constraint if exists pets_listing_type_check;
alter table public.pets drop constraint if exists pets_health_status_check;
alter table public.pets add constraint pets_status_check check (status in ('HEALTHY','NEEDS CARE','URGENT RESCUE','PET ADOPTED'));
alter table public.pets add constraint pets_adoption_stage_check check (adoption_stage in ('Available','Want to Adopt','Pending Coordinator Review','Ongoing Adoption','Pet Adopted'));
alter table public.pets add constraint pets_listing_type_check check (listing_type in ('adoption','rehome','stray'));
alter table public.pets add constraint pets_health_status_check check (health_status in ('Healthy','Needs Care'));

-- 2) ZERO PRE-LOGGED PETS: remove the old demo seed rows
delete from public.pets
where reporter_name in (
  'Maria Clara (Sampaloc Shelter)', 'Binondo Heritage Sanctuary', 'Barangay Tondo Rescue Unit',
  'Dr. Aris Ramos, DVM', 'Malate Paws Collective', 'Pandacan Community Vet'
);

-- 3) ROW LEVEL SECURITY — read / insert / update / delete, live
-- NOTE: the app's "demo login" has no Supabase Auth session, so these policies allow the
-- anon key too. Anyone with your anon key can then edit/delete pets. To lock down, change
-- "to anon, authenticated" to "to authenticated" and use real Supabase Auth sign-in.
alter table public.pets enable row level security;
drop policy if exists "Pets are viewable by everyone" on public.pets;
drop policy if exists "Authenticated users can insert pets" on public.pets;
drop policy if exists "Authenticated users can update pets" on public.pets;
drop policy if exists "pets_select" on public.pets;
drop policy if exists "pets_insert" on public.pets;
drop policy if exists "pets_update" on public.pets;
drop policy if exists "pets_delete" on public.pets;
create policy "pets_select" on public.pets for select to anon, authenticated using (true);
create policy "pets_insert" on public.pets for insert to anon, authenticated with check (true);
create policy "pets_update" on public.pets for update to anon, authenticated using (true) with check (true);
create policy "pets_delete" on public.pets for delete to anon, authenticated using (true);

grant select, insert, update, delete on public.pets to anon, authenticated;

-- 4) REALTIME REPLICATION (INSERT / UPDATE / DELETE broadcasts)
alter table public.pets replica identity full;
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pets') then
    alter publication supabase_realtime add table public.pets;
  end if;
end $$;

-- 5) The chat feature also inserts into public.messages. If messages.sender_id/owner FK blocks
-- demo users, nothing else is needed — the app inserts without sender_id.
-- (Keep your existing messages table/policies from schema.sql.)
