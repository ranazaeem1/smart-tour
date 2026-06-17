alter table public.profiles
  add column if not exists emergency_phone text;

create table if not exists public.sos_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  emergency_phone text,
  status text not null default 'active',
  location text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.sos_alerts
  add column if not exists emergency_phone text;

alter table public.sos_alerts enable row level security;

drop policy if exists "Users create SOS" on public.sos_alerts;
create policy "Users create SOS"
  on public.sos_alerts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users see own SOS" on public.sos_alerts;
create policy "Users see own SOS"
  on public.sos_alerts
  for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, emergency_phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'emergency_phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    emergency_phone = excluded.emergency_phone,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;
