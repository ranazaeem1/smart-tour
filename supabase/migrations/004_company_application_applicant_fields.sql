-- Store applicant/user details alongside company registration requests.
alter table public.companies
  add column if not exists applicant_name text,
  add column if not exists applicant_email text,
  add column if not exists applicant_phone text;
