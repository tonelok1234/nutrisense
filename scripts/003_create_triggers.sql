-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_nutritional_goals_updated_at
  before update on public.nutritional_goals
  for each row
  execute function public.handle_updated_at();

create trigger set_food_items_updated_at
  before update on public.food_items
  for each row
  execute function public.handle_updated_at();

create trigger set_meal_logs_updated_at
  before update on public.meal_logs
  for each row
  execute function public.handle_updated_at();

create trigger set_recipes_updated_at
  before update on public.recipes
  for each row
  execute function public.handle_updated_at();

create trigger set_meal_plans_updated_at
  before update on public.meal_plans
  for each row
  execute function public.handle_updated_at();

create trigger set_recipe_comments_updated_at
  before update on public.recipe_comments
  for each row
  execute function public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
