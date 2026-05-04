-- ============================================================
-- Smart Tour Platform — Supabase Database Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/auvugzgnorizyxwchper/sql
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text,
  phone       text,
  role        text not null default 'user' check (role in ('user', 'company', 'admin')),
  avatar_url  text,
  verified    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select using (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- COMPANIES
-- ============================================================
create table if not exists public.companies (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid references public.profiles(id) on delete cascade,
  name            text not null,
  email           text not null,
  phone           text,
  city            text,
  logo            text,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'suspended')),
  verified        boolean not null default false,
  rating          numeric(3,2) not null default 0,
  total_tours     integer not null default 0,
  total_bookings  integer not null default 0,
  total_revenue   bigint not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.companies enable row level security;

create policy "Anyone can view approved companies"
  on public.companies for select using (status = 'approved');
create policy "Company owners can manage their company"
  on public.companies for all using (auth.uid() = owner_id);
create policy "Admins have full access to companies"
  on public.companies for all using (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- ============================================================
-- TOURS
-- ============================================================
create table if not exists public.tours (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid references public.companies(id) on delete cascade,
  title         text not null,
  destination   text not null,
  region        text not null,
  price         integer not null,
  duration      integer not null,
  rating        numeric(3,2) not null default 0,
  review_count  integer not null default 0,
  image_url     text,
  category      text not null default 'Adventure',
  tags          text[] not null default '{}',
  max_group     integer not null default 10,
  difficulty    text not null default 'Moderate',
  highlights    text[] not null default '{}',
  included      text[] not null default '{}',
  safety_score  integer not null default 80,
  available     boolean not null default true,
  featured      boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.tours enable row level security;

create policy "Anyone can view available tours"
  on public.tours for select using (available = true);
create policy "Company owners can manage their tours"
  on public.tours for all using (
    company_id in (select id from public.companies where owner_id = auth.uid())
  );
create policy "Admins have full access to tours"
  on public.tours for all using (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- ============================================================
-- ITINERARY DAYS
-- ============================================================
create table if not exists public.itinerary_days (
  id              uuid primary key default uuid_generate_v4(),
  tour_id         uuid references public.tours(id) on delete cascade,
  day_number      integer not null,
  title           text not null,
  places          text[] not null default '{}',
  travel_time     text,
  accommodation   text,
  meals           text[] not null default '{}',
  weather         text,
  weather_icon    text
);

alter table public.itinerary_days enable row level security;

create policy "Anyone can view itinerary days"
  on public.itinerary_days for select using (true);
create policy "Company owners can manage itinerary"
  on public.itinerary_days for all using (
    tour_id in (
      select t.id from public.tours t
      join public.companies c on t.company_id = c.id
      where c.owner_id = auth.uid()
    )
  );

-- ============================================================
-- BOOKINGS
-- ============================================================
create table if not exists public.bookings (
  id              uuid primary key default uuid_generate_v4(),
  tour_id         uuid references public.tours(id),
  user_id         uuid references public.profiles(id),
  company_id      uuid references public.companies(id),
  group_size      integer not null default 1,
  total_price     integer not null,
  travel_date     date not null,
  status          text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  payment_status  text not null default 'pending' check (payment_status in ('paid','pending','refunded')),
  notes           text,
  created_at      timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "Users can view their own bookings"
  on public.bookings for select using (auth.uid() = user_id);
create policy "Users can create bookings"
  on public.bookings for insert with check (auth.uid() = user_id);
create policy "Company owners can view/update their bookings"
  on public.bookings for all using (
    company_id in (select id from public.companies where owner_id = auth.uid())
  );
create policy "Admins have full access to bookings"
  on public.bookings for all using (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id            uuid primary key default uuid_generate_v4(),
  tour_id       uuid references public.tours(id) on delete cascade,
  user_id       uuid references public.profiles(id),
  booking_id    uuid references public.bookings(id),
  rating        integer not null check (rating between 1 and 5),
  comment       text not null,
  sentiment     text not null default 'neutral' check (sentiment in ('positive','neutral','negative')),
  helpful_count integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Anyone can view reviews"
  on public.reviews for select using (true);
create policy "Users can create reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update/delete their own reviews"
  on public.reviews for all using (auth.uid() = user_id);
create policy "Admins have full access to reviews"
  on public.reviews for all using (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- ============================================================
-- SAFETY ZONES
-- ============================================================
create table if not exists public.safety_zones (
  id          uuid primary key default uuid_generate_v4(),
  area        text not null unique,
  score       integer not null check (score between 0 and 100),
  status      text not null,
  updated_at  timestamptz not null default now()
);

alter table public.safety_zones enable row level security;

create policy "Anyone can view safety zones"
  on public.safety_zones for select using (true);
create policy "Admins can manage safety zones"
  on public.safety_zones for all using (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- ============================================================
-- SAFETY ALERTS
-- ============================================================
create table if not exists public.safety_alerts (
  id          uuid primary key default uuid_generate_v4(),
  area        text not null,
  type        text not null,
  severity    text not null check (severity in ('low','medium','high')),
  description text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.safety_alerts enable row level security;

create policy "Anyone can view active safety alerts"
  on public.safety_alerts for select using (active = true);
create policy "Admins can manage safety alerts"
  on public.safety_alerts for all using (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- ============================================================
-- SEED DATA — Initial safety zones
-- ============================================================
insert into public.safety_zones (area, score, status) values
  ('Hunza Valley', 94, 'Safe'),
  ('Skardu', 87, 'Safe'),
  ('Swat Valley', 82, 'Moderate'),
  ('Naran Kaghan', 95, 'Very Safe'),
  ('Fairy Meadows', 89, 'Safe'),
  ('Gilgit City', 78, 'Moderate'),
  ('Murree', 90, 'Safe'),
  ('Nathia Gali', 92, 'Safe'),
  ('Kalam', 85, 'Safe'),
  ('Malam Jabba', 88, 'Safe')
on conflict (area) do nothing;

-- Seed initial alerts
insert into public.safety_alerts (area, type, severity, description) values
  ('Babusar Top', 'Road Closure', 'high', 'Heavy snowfall has closed the road. Expected reopening: 3 days.'),
  ('Gilgit City', 'Security Notice', 'medium', 'Minor civil unrest reported. Tourists advised to stay in hotels after 9pm.'),
  ('Khunjerab Pass', 'Weather Alert', 'medium', 'Strong winds forecast for next 48 hours. Visibility may be poor.'),
  ('Hunza Valley', 'All Clear', 'low', 'All routes accessible. Weather clear. Safe for travel.')
on conflict do nothing;
