-- AusbildungsKompass MVP schema. Run in a new Supabase project.
create extension if not exists "pgcrypto";

create type public.application_status as enum ('saved', 'prepared', 'applied', 'interview', 'accepted', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  city text not null default '',
  phone text not null default '',
  birth_date date,
  photo_path text,
  school_degree text not null default '',
  school text not null default '',
  graduation_year integer,
  experience text not null default '',
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text not null unique,
  source_job_id text,
  title text not null,
  company text not null,
  location text not null,
  description text not null,
  requirements jsonb not null default '[]',
  salary_text text,
  starts_on date,
  published_at timestamptz,
  expires_at timestamptz,
  raw_payload jsonb not null default '{}',
  last_verified_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status public.application_status not null default 'saved',
  notes text not null default '',
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, job_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  kind text not null check (kind in ('cv', 'cover_letter')),
  content jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, job_id)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  citations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  transcript jsonb not null default '[]',
  feedback jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.interview_sessions enable row level security;

create policy "jobs are readable" on public.jobs for select to authenticated using (true);
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own applications" on public.applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own documents" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own threads" on public.chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own messages" on public.chat_messages for all using (exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id = auth.uid())) with check (exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id = auth.uid()));
create policy "own interviews" on public.interview_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles (id, first_name, last_name) values (new.id, coalesce(new.raw_user_meta_data->>'first_name',''), coalesce(new.raw_user_meta_data->>'last_name','')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

