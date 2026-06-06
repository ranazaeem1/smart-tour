-- Add licensed company NTN number support.
alter table public.companies
  add column if not exists ntn_number text;

alter table public.companies
  drop constraint if exists companies_ntn_number_format;

alter table public.companies
  add constraint companies_ntn_number_format
  check (ntn_number is null or ntn_number ~ '^[0-9]{7}$');
