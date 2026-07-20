-- Everything Finance — database schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Idempotent: safe to re-run.

-- ============ Content tables (written by the ingestion job only) ============

create table if not exists articles (
  id            uuid primary key default gen_random_uuid(),
  url           text not null unique,
  title         text not null,
  title_key     text not null,
  description   text,
  source        text not null,
  hint          text,
  summary       text,
  categories    text[] not null default '{}',
  status        text not null default 'pending', -- pending | live | error
  attempts      int  not null default 0,
  published_at  timestamptz not null,
  created_at    timestamptz not null default now()
);
create index if not exists articles_title_key_idx on articles (title_key);
create index if not exists articles_feed_idx on articles (status, published_at desc);
create index if not exists articles_categories_idx on articles using gin (categories);

create table if not exists recaps (
  recap_date  date primary key,
  bullets     jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists quizzes (
  id          uuid primary key default gen_random_uuid(),
  week_start  date not null unique,
  questions   jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists flashcards (
  id          uuid primary key default gen_random_uuid(),
  week_start  date not null,
  front       text not null,
  back        text not null,
  category    text not null default 'macro',
  created_at  timestamptz not null default now()
);
create index if not exists flashcards_week_idx on flashcards (week_start desc);

create table if not exists glossary (
  slug        text primary key,
  term        text not null,
  definition  text not null,
  source      text not null default 'seed', -- seed | ai
  created_at  timestamptz not null default now()
);

-- Tracks Gemini calls per ET day (the daily budget ceiling).
create table if not exists ai_usage (
  usage_date  date primary key,
  calls       int not null default 0
);

-- ============ User tables (owned by each signed-in user) ============

create table if not exists streaks (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  current_streak      int not null default 0,
  longest_streak      int not null default 0,
  last_activity_date  date
);

create table if not exists quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  quiz_id     uuid not null references quizzes (id) on delete cascade,
  score       int not null,
  total       int not null,
  created_at  timestamptz not null default now()
);
create index if not exists quiz_attempts_user_idx on quiz_attempts (user_id, created_at desc);

create table if not exists card_progress (
  user_id           uuid not null references auth.users (id) on delete cascade,
  card_id           uuid not null references flashcards (id) on delete cascade,
  ease              real not null default 2.5,
  interval_days     int  not null default 0,
  reps              int  not null default 0,
  lapses            int  not null default 0,
  due_date          date not null,
  last_reviewed_at  timestamptz,
  primary key (user_id, card_id)
);

-- ============ Helper functions (called by the server with service role) ============

create or replace function increment_ai_usage(p_date date, p_calls int)
returns void
language sql
security definer
set search_path = public
as $$
  insert into ai_usage (usage_date, calls)
  values (p_date, p_calls)
  on conflict (usage_date) do update set calls = ai_usage.calls + p_calls;
$$;

create or replace function bump_article_attempts(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update articles
  set attempts = attempts + 1,
      status = case when attempts + 1 >= 3 then 'error' else status end
  where id = p_id;
$$;

revoke execute on function increment_ai_usage(date, int) from anon, authenticated;
revoke execute on function bump_article_attempts(uuid) from anon, authenticated;

-- ============ Row Level Security ============

alter table articles      enable row level security;
alter table recaps        enable row level security;
alter table quizzes       enable row level security;
alter table flashcards    enable row level security;
alter table glossary      enable row level security;
alter table ai_usage      enable row level security;
alter table streaks       enable row level security;
alter table quiz_attempts enable row level security;
alter table card_progress enable row level security;

-- Content is public to read; only the service role (ingestion job) writes.
drop policy if exists "public read articles" on articles;
create policy "public read articles" on articles for select using (status = 'live');

drop policy if exists "public read recaps" on recaps;
create policy "public read recaps" on recaps for select using (true);

drop policy if exists "public read quizzes" on quizzes;
create policy "public read quizzes" on quizzes for select using (true);

drop policy if exists "public read flashcards" on flashcards;
create policy "public read flashcards" on flashcards for select using (true);

drop policy if exists "public read glossary" on glossary;
create policy "public read glossary" on glossary for select using (true);

-- ai_usage: no client access at all (service role bypasses RLS).

-- User rows: each signed-in user manages only their own.
drop policy if exists "own streaks" on streaks;
create policy "own streaks" on streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own quiz attempts" on quiz_attempts;
create policy "own quiz attempts" on quiz_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own card progress" on card_progress;
create policy "own card progress" on card_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
