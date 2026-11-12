-- PawPath Manila: Complete PostgreSQL Schema, RLS Policies, Storage & Seed Data
-- Run this script in your Supabase SQL Editor.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Verified Metro Manila Users & Shelters)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  mobile text,
  age integer check (age >= 18),
  is_adult_confirmed boolean not null default false,
  district text not null,
  barangay text,
  role text not null default 'citizen' check (role in ('citizen', 'adopter', 'shelter', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. PETS TABLE (Adoptables, Rehoming Listings & Stray Reports)
create table if not exists public.pets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  species text not null check (species in ('Dog', 'Cat', 'Other')),
  breed text not null,
  age_label text not null,
  status text not null default 'HEALTHY' check (status in ('HEALTHY', 'NEEDS CARE', 'URGENT RESCUE', 'PET ADOPTED')),
  adoption_stage text not null default 'Available' check (adoption_stage in ('Available', 'Want to Adopt', 'Ongoing Adoption', 'Pet Adopted')),
  listing_type text not null default 'adoption' check (listing_type in ('adoption', 'rehome', 'stray')),
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
  owner_id uuid references public.profiles(id) on delete set null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.pets enable row level security;
create policy "Pets are viewable by everyone" on public.pets for select using (true);
create policy "Authenticated users can insert pets" on public.pets for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update pets" on public.pets for update using (auth.role() = 'authenticated');

-- 3. ADOPTION APPLICATIONS TABLE
create table if not exists public.adoption_applications (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid references public.pets(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  applicant_name text not null,
  stage text not null default 'Want to Adopt' check (stage in ('Available', 'Want to Adopt', 'Ongoing Adoption', 'Pet Adopted')),
  home_environment text,
  valid_id_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.adoption_applications enable row level security;
create policy "Applications viewable by authenticated users" on public.adoption_applications for select using (auth.role() = 'authenticated');
create policy "Users can create adoption applications" on public.adoption_applications for insert with check (auth.uid() = applicant_id);
create policy "Authenticated users can update applications" on public.adoption_applications for update using (auth.role() = 'authenticated');

-- 4. RA 10631 ANIMAL WELFARE ACT DIGITAL AGREEMENTS
create table if not exists public.ra10631_agreements (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid references public.adoption_applications(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete cascade not null,
  adopter_id uuid references public.profiles(id) on delete cascade not null,
  adopter_full_name text not null,
  government_id_ref text not null,
  home_check_confirmed boolean not null default true,
  anti_cruelty_agreed boolean not null default true,
  non_relinquishment_agreed boolean not null default true,
  digital_signature text not null,
  signed_at timestamptz not null default now()
);

alter table public.ra10631_agreements enable row level security;
create policy "Users can view their own agreements" on public.ra10631_agreements for select using (auth.uid() = adopter_id);
create policy "Users can sign RA 10631 agreements" on public.ra10631_agreements for insert with check (auth.uid() = adopter_id);

-- 5. REALTIME MESSAGES TABLE
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid references public.pets(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text not null,
  sender_role text not null default 'adopter' check (sender_role in ('adopter', 'coordinator', 'system')),
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
create policy "Messages are viewable by authenticated users" on public.messages for select using (auth.role() = 'authenticated');
create policy "Authenticated users can send messages" on public.messages for insert with check (auth.role() = 'authenticated');

-- Enable Realtime for messages and pets
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.pets;

-- 6. HEALTH CENTERS DIRECTORY
create table if not exists public.health_centers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null check (category in ('Government Office', 'Public Hospital', 'Private Partner', 'Volunteer Rescue Clinic')),
  address text not null,
  district text not null,
  phone text not null,
  hours text not null,
  lat double precision not null,
  lng double precision not null,
  services jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.health_centers enable row level security;
create policy "Health centers viewable by everyone" on public.health_centers for select using (true);

-- 7. FOOD & SUPPLY SHOPS DIRECTORY
create table if not exists public.food_shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  district text not null,
  phone text not null,
  tags text[] default '{}',
  lat double precision not null,
  lng double precision not null,
  diet_guide text,
  catalog jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.food_shops enable row level security;
create policy "Food shops viewable by everyone" on public.food_shops for select using (true);

-- 8. SUPPLY-ONLY RESERVATION ORDERS (Strictly No Live Animal Delivery)
create table if not exists public.supply_orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  delivery_address text not null,
  items jsonb not null,
  total_php numeric(10, 2) not null,
  status text not null default 'reserved' check (status in ('reserved', 'confirmed', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.supply_orders enable row level security;
create policy "Users can view own supply orders" on public.supply_orders for select using (auth.uid() = user_id);
create policy "Authenticated users can place supply orders" on public.supply_orders for insert with check (auth.role() = 'authenticated');

-- 9. CONTACT MESSAGES TABLE
create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  sender_name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
create policy "Anyone can submit contact inquiries" on public.contact_messages for insert with check (true);

-- 10. STORAGE BUCKET FOR PET PHOTOS
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

create policy "Pet photos are publicly accessible" on storage.objects for select using (bucket_id = 'pet-photos');
create policy "Authenticated users can upload pet photos" on storage.objects for insert with check (bucket_id = 'pet-photos' and auth.role() = 'authenticated');

-- 11. SEED DATA: METRO MANILA PETS
insert into public.pets (name, species, breed, age_label, status, adoption_stage, listing_type, district, barangay, lat, lng, vaccinated, medical_notes, reporter_name)
values
  ('Bantay', 'Dog', 'Local Aspin / Dog', '1.5 Years', 'HEALTHY', 'Available', 'adoption', 'Sampaloc', 'Barangay 402, Sampaloc, Manila', 14.6091, 120.9923, true, '5-in-1 & Anti-Rabies vaccinated, dewormed, gentle with children.', 'Maria Clara (Sampaloc Shelter)'),
  ('Muning', 'Cat', 'Domestic Shorthair / Cat', '2 Years', 'NEEDS CARE', 'Available', 'adoption', 'Binondo', 'Plaza San Lorenzo Ruiz, Binondo, Manila', 14.5998, 120.9746, true, 'Spayed calico Puspin recovering from minor ear mite treatment.', 'Binondo Heritage Sanctuary'),
  ('Soju', 'Dog', 'Golden Retriever Mix / Dog', '8 Months', 'URGENT RESCUE', 'Available', 'stray', 'Tondo', 'Near Pritil Market, Tondo, Manila', 14.6188, 120.9675, false, 'Found limping near market; needs immediate foster and vet check.', 'Barangay Tondo Rescue Unit'),
  ('Luna', 'Cat', 'Domestic Longhair / Cat', '1 Year', 'HEALTHY', 'Available', 'adoption', 'Ermita', 'Padre Faura St, Ermita, Manila', 14.5794, 120.9845, true, 'Litter-trained, spayed, calm indoor companion.', 'Dr. Aris Ramos, DVM'),
  ('Cooper', 'Dog', 'Aspin Puppy / Dog', '5 Months', 'HEALTHY', 'Available', 'adoption', 'Malate', 'Remedios Circle, Malate, Manila', 14.5714, 120.9882, true, 'First puppy shots complete, energetic and socialized.', 'Malate Paws Collective'),
  ('Peanut', 'Cat', 'Tabby Mix / Cat', '3 Months', 'NEEDS CARE', 'Available', 'adoption', 'Pandacan', 'Zamora St, Pandacan, Manila', 14.5882, 121.0031, false, 'Underweight kitten on nutrient-rich wet food recovery.', 'Pandacan Community Vet');
