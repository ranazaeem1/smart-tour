create extension if not exists vector;

alter table public.tours
  add column if not exists embedding vector(768);

alter table public.tours
  add column if not exists active_from date not null default current_date,
  add column if not exists active_until date;

create index if not exists tours_embedding_ivfflat_idx
  on public.tours
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

drop function if exists public.match_tours(vector, float, int, int);

create or replace function public.match_tours(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  max_budget int
)
returns table (
  id uuid,
  company_id uuid,
  title text,
  destination text,
  region text,
  price numeric,
  duration int,
  rating numeric,
  review_count int,
  image_url text,
  category text,
  tags text[],
  max_group int,
  difficulty text,
  highlights text[],
  included text[],
  safety_score int,
  available boolean,
  active_from date,
  active_until date,
  featured boolean,
  created_at timestamptz,
  similarity float
)
language sql
stable
as $$
  select
    t.id,
    t.company_id,
    t.title,
    t.destination,
    t.region,
    t.price::numeric,
    t.duration::int,
    t.rating::numeric,
    t.review_count::int,
    t.image_url,
    t.category,
    t.tags,
    t.max_group::int,
    t.difficulty,
    t.highlights,
    t.included,
    t.safety_score::int,
    t.available,
    t.active_from,
    t.active_until,
    t.featured,
    t.created_at,
    1 - (t.embedding <=> query_embedding) as similarity
  from public.tours t
  where t.embedding is not null
    and t.available = true
    and t.price <= max_budget
    and (t.active_until is null or t.active_until >= current_date)
    and 1 - (t.embedding <=> query_embedding) >= match_threshold
  order by t.embedding <=> query_embedding
  limit match_count;
$$;
