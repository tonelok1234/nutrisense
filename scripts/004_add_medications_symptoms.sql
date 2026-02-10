-- Medications and supplements tracking
create table if not exists public.medications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  dosage text,
  frequency text,
  time_of_day text[],
  notes text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Medication logs (when user takes medication)
create table if not exists public.medication_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  medication_id uuid references public.medications(id) on delete cascade,
  medication_name text, -- for quick logging without predefined medication
  dosage text,
  taken_at timestamp with time zone default now(),
  notes text,
  created_at timestamp with time zone default now()
);

-- Symptom logs
create table if not exists public.symptom_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  symptom_type text not null,
  severity integer check (severity between 1 and 10),
  description text,
  photo_url text,
  logged_at timestamp with time zone default now(),
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.medications enable row level security;
alter table public.medication_logs enable row level security;
alter table public.symptom_logs enable row level security;

-- Medications policies
create policy "Users can view their own medications" on public.medications for select using (auth.uid() = user_id);
create policy "Users can insert their own medications" on public.medications for insert with check (auth.uid() = user_id);
create policy "Users can update their own medications" on public.medications for update using (auth.uid() = user_id);
create policy "Users can delete their own medications" on public.medications for delete using (auth.uid() = user_id);

-- Medication logs policies
create policy "Users can view their own medication logs" on public.medication_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own medication logs" on public.medication_logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own medication logs" on public.medication_logs for update using (auth.uid() = user_id);
create policy "Users can delete their own medication logs" on public.medication_logs for delete using (auth.uid() = user_id);

-- Symptom logs policies
create policy "Users can view their own symptom logs" on public.symptom_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own symptom logs" on public.symptom_logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own symptom logs" on public.symptom_logs for update using (auth.uid() = user_id);
create policy "Users can delete their own symptom logs" on public.symptom_logs for delete using (auth.uid() = user_id);

-- Indexes
create index idx_medications_user_id on public.medications(user_id);
create index idx_medication_logs_user_date on public.medication_logs(user_id, taken_at);
create index idx_symptom_logs_user_date on public.symptom_logs(user_id, logged_at);
