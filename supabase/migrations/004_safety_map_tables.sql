create table if not exists public.safety_data (
  id uuid primary key default gen_random_uuid(),
  destination text not null,
  latitude double precision not null,
  longitude double precision not null,
  overall_safety_score integer not null default 80 check (overall_safety_score between 0 and 100),
  weather_risk_factor integer not null default 20 check (weather_risk_factor between 0 and 100),
  crime_risk integer not null default 15 check (crime_risk between 0 and 100),
  terrain_difficulty integer not null default 40 check (terrain_difficulty between 0 and 100),
  accessibility_score integer not null default 75 check (accessibility_score between 0 and 100),
  last_updated timestamptz not null default now()
);

alter table public.safety_data enable row level security;

drop policy if exists "Safety data is readable by authenticated users" on public.safety_data;
create policy "Safety data is readable by authenticated users"
  on public.safety_data for select
  to authenticated
  using (true);

create table if not exists public.trip_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  origin_lat double precision not null,
  origin_lng double precision not null,
  destination_lat double precision not null,
  destination_lng double precision not null,
  route_geojson jsonb not null,
  distance_km numeric not null default 0,
  estimated_duration_minutes integer not null default 0,
  current_location_lat double precision,
  current_location_lng double precision,
  progress_percentage integer not null default 0 check (progress_percentage between 0 and 100),
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.trip_routes enable row level security;

drop policy if exists "Users can read own trip routes" on public.trip_routes;
create policy "Users can read own trip routes"
  on public.trip_routes for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own trip routes" on public.trip_routes;
create policy "Users can insert own trip routes"
  on public.trip_routes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own trip routes" on public.trip_routes;
create policy "Users can update own trip routes"
  on public.trip_routes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
