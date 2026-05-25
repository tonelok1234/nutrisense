-- Add language and source columns to food_items
alter table public.food_items
  add column if not exists name_nb text,
  add column if not exists name_en text,
  add column if not exists source text default 'custom'
    check (source in ('matvaretabellen', 'open_food_facts', 'custom')),
  add column if not exists external_id text;

-- Index for fast source lookups and text search
create index if not exists idx_food_items_source on public.food_items(source);
create index if not exists idx_food_items_external_id on public.food_items(external_id);
create index if not exists idx_food_items_name_search on public.food_items
  using gin(to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(name_en, '')));
