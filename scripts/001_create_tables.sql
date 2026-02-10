-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  date_of_birth date,
  height_cm decimal(5,2),
  weight_kg decimal(5,2),
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  activity_level text check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  dietary_preferences text[], -- array of preferences like 'vegetarian', 'vegan', 'gluten-free', etc.
  health_goals text[], -- array of goals like 'weight_loss', 'muscle_gain', 'maintenance', etc.
  allergies text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Daily nutritional goals
create table if not exists public.nutritional_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  calories integer,
  protein_g decimal(6,2),
  carbs_g decimal(6,2),
  fats_g decimal(6,2),
  fiber_g decimal(6,2),
  water_ml integer,
  sodium_mg integer,
  sugar_g decimal(6,2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Food items (user can create custom foods or use AI-analyzed ones)
create table if not exists public.food_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  brand text,
  serving_size text,
  serving_unit text,
  calories integer,
  protein_g decimal(6,2),
  carbs_g decimal(6,2),
  fats_g decimal(6,2),
  fiber_g decimal(6,2),
  sodium_mg integer,
  sugar_g decimal(6,2),
  is_custom boolean default false,
  is_public boolean default false, -- allow sharing with community
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Meal logs
create table if not exists public.meal_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  meal_date date not null,
  meal_time time,
  photo_url text,
  ai_analysis jsonb, -- stores AI-generated nutritional analysis
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Food items in meal logs (many-to-many relationship)
create table if not exists public.meal_log_items (
  id uuid primary key default uuid_generate_v4(),
  meal_log_id uuid references public.meal_logs(id) on delete cascade not null,
  food_item_id uuid references public.food_items(id) on delete cascade,
  quantity decimal(6,2) not null,
  unit text not null,
  manual_entry jsonb, -- for manual nutritional entry when no food_item_id
  created_at timestamp with time zone default now()
);

-- Water intake tracking
create table if not exists public.water_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null,
  amount_ml integer not null,
  logged_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Recipes
create table if not exists public.recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  ingredients jsonb not null, -- array of {name, quantity, unit}
  instructions text[],
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer,
  nutritional_info jsonb, -- per serving
  tags text[],
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  photo_url text,
  is_ai_generated boolean default false,
  is_public boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Meal plans
create table if not exists public.meal_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean default false,
  created_by_ai boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Meal plan items (links recipes to specific days/meals)
create table if not exists public.meal_plan_items (
  id uuid primary key default uuid_generate_v4(),
  meal_plan_id uuid references public.meal_plans(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) on delete cascade,
  meal_date date not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  notes text,
  created_at timestamp with time zone default now()
);

-- Favorite recipes
create table if not exists public.favorite_recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, recipe_id)
);

-- Social features: followers/following
create table if not exists public.user_follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- Social features: recipe likes
create table if not exists public.recipe_likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, recipe_id)
);

-- Social features: recipe comments
create table if not exists public.recipe_comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  comment text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Reactions/moods tracking
create table if not exists public.mood_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null,
  mood text check (mood in ('great', 'good', 'okay', 'bad', 'terrible')) not null,
  energy_level integer check (energy_level between 1 and 10),
  stress_level integer check (stress_level between 1 and 10),
  sleep_hours decimal(3,1),
  notes text,
  ai_insights jsonb, -- AI-generated insights linking mood to nutrition
  created_at timestamp with time zone default now()
);

-- Fitness/exercise tracking
create table if not exists public.exercise_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null,
  exercise_type text not null,
  duration_minutes integer,
  calories_burned integer,
  notes text,
  created_at timestamp with time zone default now()
);

-- Integrations tracking (for future wearables/fitness apps)
create table if not exists public.user_integrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  integration_type text not null, -- 'fitbit', 'apple_health', 'google_fit', etc.
  is_active boolean default true,
  settings jsonb,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(user_id, integration_type)
);

-- Create indexes for better query performance
create index idx_profiles_user_id on public.profiles(id);
create index idx_meal_logs_user_date on public.meal_logs(user_id, meal_date);
create index idx_water_logs_user_date on public.water_logs(user_id, log_date);
create index idx_recipes_user_id on public.recipes(user_id);
create index idx_recipes_public on public.recipes(is_public) where is_public = true;
create index idx_meal_plans_user_active on public.meal_plans(user_id, is_active);
create index idx_mood_logs_user_date on public.mood_logs(user_id, log_date);
create index idx_exercise_logs_user_date on public.exercise_logs(user_id, log_date);
