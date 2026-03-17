-- Glucose readings table (for Dexcom and other CGM integrations)
create table if not exists public.glucose_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  recorded_at timestamp with time zone not null,
  glucose_mgdl integer not null,
  trend text, -- 'flat', 'singleUp', 'singleDown', 'doubleUp', 'doubleDown', etc.
  source text default 'dexcom',
  created_at timestamp with time zone default now(),
  unique(user_id, recorded_at)
);

create index if not exists idx_glucose_logs_user_time on public.glucose_logs(user_id, recorded_at);

alter table public.glucose_logs enable row level security;

create policy "Users can manage own glucose logs"
  on public.glucose_logs for all
  using (auth.uid() = user_id);
