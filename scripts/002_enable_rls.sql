-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.nutritional_goals enable row level security;
alter table public.food_items enable row level security;
alter table public.meal_logs enable row level security;
alter table public.meal_log_items enable row level security;
alter table public.water_logs enable row level security;
alter table public.recipes enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_plan_items enable row level security;
alter table public.favorite_recipes enable row level security;
alter table public.user_follows enable row level security;
alter table public.recipe_likes enable row level security;
alter table public.recipe_comments enable row level security;
alter table public.mood_logs enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.user_integrations enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can view public profiles"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Nutritional goals policies
create policy "Users can view their own goals"
  on public.nutritional_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on public.nutritional_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.nutritional_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.nutritional_goals for delete
  using (auth.uid() = user_id);

-- Food items policies
create policy "Users can view their own food items"
  on public.food_items for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert their own food items"
  on public.food_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own food items"
  on public.food_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own food items"
  on public.food_items for delete
  using (auth.uid() = user_id);

-- Meal logs policies
create policy "Users can view their own meal logs"
  on public.meal_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meal logs"
  on public.meal_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meal logs"
  on public.meal_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meal logs"
  on public.meal_logs for delete
  using (auth.uid() = user_id);

-- Meal log items policies
create policy "Users can view their own meal log items"
  on public.meal_log_items for select
  using (exists (
    select 1 from public.meal_logs
    where meal_logs.id = meal_log_items.meal_log_id
    and meal_logs.user_id = auth.uid()
  ));

create policy "Users can insert their own meal log items"
  on public.meal_log_items for insert
  with check (exists (
    select 1 from public.meal_logs
    where meal_logs.id = meal_log_items.meal_log_id
    and meal_logs.user_id = auth.uid()
  ));

create policy "Users can update their own meal log items"
  on public.meal_log_items for update
  using (exists (
    select 1 from public.meal_logs
    where meal_logs.id = meal_log_items.meal_log_id
    and meal_logs.user_id = auth.uid()
  ));

create policy "Users can delete their own meal log items"
  on public.meal_log_items for delete
  using (exists (
    select 1 from public.meal_logs
    where meal_logs.id = meal_log_items.meal_log_id
    and meal_logs.user_id = auth.uid()
  ));

-- Water logs policies
create policy "Users can view their own water logs"
  on public.water_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own water logs"
  on public.water_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own water logs"
  on public.water_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own water logs"
  on public.water_logs for delete
  using (auth.uid() = user_id);

-- Recipes policies
create policy "Users can view public recipes and their own"
  on public.recipes for select
  using (is_public = true or auth.uid() = user_id);

create policy "Users can insert their own recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
  on public.recipes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);

-- Meal plans policies
create policy "Users can view their own meal plans"
  on public.meal_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meal plans"
  on public.meal_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meal plans"
  on public.meal_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meal plans"
  on public.meal_plans for delete
  using (auth.uid() = user_id);

-- Meal plan items policies
create policy "Users can view their own meal plan items"
  on public.meal_plan_items for select
  using (exists (
    select 1 from public.meal_plans
    where meal_plans.id = meal_plan_items.meal_plan_id
    and meal_plans.user_id = auth.uid()
  ));

create policy "Users can insert their own meal plan items"
  on public.meal_plan_items for insert
  with check (exists (
    select 1 from public.meal_plans
    where meal_plans.id = meal_plan_items.meal_plan_id
    and meal_plans.user_id = auth.uid()
  ));

create policy "Users can update their own meal plan items"
  on public.meal_plan_items for update
  using (exists (
    select 1 from public.meal_plans
    where meal_plans.id = meal_plan_items.meal_plan_id
    and meal_plans.user_id = auth.uid()
  ));

create policy "Users can delete their own meal plan items"
  on public.meal_plan_items for delete
  using (exists (
    select 1 from public.meal_plans
    where meal_plans.id = meal_plan_items.meal_plan_id
    and meal_plans.user_id = auth.uid()
  ));

-- Favorite recipes policies
create policy "Users can view their own favorites"
  on public.favorite_recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorite_recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorite_recipes for delete
  using (auth.uid() = user_id);

-- User follows policies
create policy "Users can view all follows"
  on public.user_follows for select
  using (true);

create policy "Users can follow others"
  on public.user_follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow others"
  on public.user_follows for delete
  using (auth.uid() = follower_id);

-- Recipe likes policies
create policy "Users can view all recipe likes"
  on public.recipe_likes for select
  using (true);

create policy "Users can like recipes"
  on public.recipe_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike recipes"
  on public.recipe_likes for delete
  using (auth.uid() = user_id);

-- Recipe comments policies
create policy "Users can view all recipe comments"
  on public.recipe_comments for select
  using (true);

create policy "Users can insert their own comments"
  on public.recipe_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.recipe_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.recipe_comments for delete
  using (auth.uid() = user_id);

-- Mood logs policies
create policy "Users can view their own mood logs"
  on public.mood_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own mood logs"
  on public.mood_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own mood logs"
  on public.mood_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own mood logs"
  on public.mood_logs for delete
  using (auth.uid() = user_id);

-- Exercise logs policies
create policy "Users can view their own exercise logs"
  on public.exercise_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own exercise logs"
  on public.exercise_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own exercise logs"
  on public.exercise_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own exercise logs"
  on public.exercise_logs for delete
  using (auth.uid() = user_id);

-- User integrations policies
create policy "Users can view their own integrations"
  on public.user_integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own integrations"
  on public.user_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own integrations"
  on public.user_integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own integrations"
  on public.user_integrations for delete
  using (auth.uid() = user_id);
