create table if not exists public.sql_sprint_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_question integer not null default 0,
  score integer not null default 0,
  streak integer not null default 0,
  solved jsonb not null default '[]'::jsonb,
  missed jsonb not null default '[]'::jsonb,
  skill jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.sql_sprint_progress
add column if not exists missed jsonb not null default '[]'::jsonb;

alter table public.sql_sprint_progress enable row level security;

drop policy if exists "Users can read own SQL Sprint progress" on public.sql_sprint_progress;
create policy "Users can read own SQL Sprint progress"
on public.sql_sprint_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own SQL Sprint progress" on public.sql_sprint_progress;
create policy "Users can insert own SQL Sprint progress"
on public.sql_sprint_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own SQL Sprint progress" on public.sql_sprint_progress;
create policy "Users can update own SQL Sprint progress"
on public.sql_sprint_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
