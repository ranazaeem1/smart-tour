alter table public.tours
  add column if not exists active_from date not null default current_date,
  add column if not exists active_until date;

alter table public.tours
  drop constraint if exists tours_active_until_after_from,
  add constraint tours_active_until_after_from check (active_until is null or active_until >= active_from);

create or replace function public.validate_tour_availability_dates()
returns trigger as $$
begin
  if new.active_from < current_date then
    raise exception 'Tour active_from cannot be in the past';
  end if;

  if new.active_until is not null and new.active_until < new.active_from then
    raise exception 'Tour active_until cannot be before active_from';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists validate_tour_availability_dates on public.tours;
create trigger validate_tour_availability_dates
  before insert or update of active_from, active_until on public.tours
  for each row
  execute function public.validate_tour_availability_dates();
