-- Run this in Supabase SQL Editor for NEXUS PLAY.
-- Uses Supabase Auth identities and row-level security so users only see their own data.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Player',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_favourites (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table if not exists public.user_recent_games (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  played_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

alter table public.user_profiles enable row level security;
alter table public.user_favourites enable row level security;
alter table public.user_recent_games enable row level security;

create policy "Users can read own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own favourites" on public.user_favourites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own recent games" on public.user_recent_games for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- The frontend only receives the Supabase anon key. Never place service-role keys in Vercel client variables.
