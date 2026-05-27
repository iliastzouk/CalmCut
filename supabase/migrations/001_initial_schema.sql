-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  goal_weight numeric(5,2) not null default 75,
  start_weight numeric(5,2) not null default 83,
  current_weight numeric(5,2),
  daily_calorie_target integer not null default 1700,
  created_at timestamptz default now() not null
);

alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- ============================================================
-- DAILY LOGS
-- ============================================================
create table public.daily_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  date date not null,
  morning_weight numeric(5,2),
  total_calories integer default 0,
  water_ml integer default 0,
  hunger_level smallint check (hunger_level >= 1 and hunger_level <= 10),
  craving_level smallint check (craving_level >= 1 and craving_level <= 10),
  mood smallint check (mood >= 1 and mood <= 10),
  notes text,
  ai_summary text,
  created_at timestamptz default now() not null,
  unique (user_id, date)
);

alter table public.daily_logs enable row level security;
create policy "Users can CRUD own daily logs" on public.daily_logs
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- MEALS
-- ============================================================
create table public.meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  daily_log_id uuid references public.daily_logs on delete set null,
  date date not null,
  name text not null,
  description text,
  category text not null check (category in ('breakfast','snack','lunch','dinner','late_night')),
  calories_manual integer,
  calories_estimated integer,
  calories_confidence text check (calories_confidence in ('low','medium','high')),
  protein_g numeric(5,1),
  carbs_g numeric(5,1),
  fat_g numeric(5,1),
  fiber_g numeric(5,1),
  image_url text,
  is_favorite boolean default false,
  tags text[],
  created_at timestamptz default now() not null
);

alter table public.meals enable row level security;
create policy "Users can CRUD own meals" on public.meals
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index on public.meals (user_id, date);

-- ============================================================
-- FOOD ITEMS (Library)
-- ============================================================
create table public.food_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  name text not null,
  calories_per_serving integer not null,
  serving_size text not null,
  protein_g numeric(5,1),
  carbs_g numeric(5,1),
  fat_g numeric(5,1),
  fiber_g numeric(5,1),
  is_favorite boolean default false,
  usage_count integer default 0,
  created_at timestamptz default now() not null
);

alter table public.food_items enable row level security;
create policy "Users can CRUD own food items" on public.food_items
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- WEIGHT ENTRIES
-- ============================================================
create table public.weight_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  date date not null,
  weight_kg numeric(5,2) not null,
  body_fat_pct numeric(4,1),
  notes text,
  created_at timestamptz default now() not null
);

alter table public.weight_entries enable row level security;
create policy "Users can CRUD own weight entries" on public.weight_entries
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index on public.weight_entries (user_id, date);

-- ============================================================
-- WATER ENTRIES
-- ============================================================
create table public.water_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  date date not null,
  amount_ml integer not null,
  created_at timestamptz default now() not null
);

alter table public.water_entries enable row level security;
create policy "Users can CRUD own water entries" on public.water_entries
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- AI INSIGHTS
-- ============================================================
create table public.ai_insights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  date date not null,
  type text check (type in ('daily','weekly','pattern','suggestion')),
  content text not null,
  metadata jsonb,
  created_at timestamptz default now() not null
);

alter table public.ai_insights enable row level security;
create policy "Users can CRUD own insights" on public.ai_insights
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
