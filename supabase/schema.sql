-- NexCreator V5 — migrasi awal (idempotent)
-- Jalankan di Supabase SQL Editor SETELAH proyek di-restore (saat ini INACTIVE/paused).
-- Aman dijalankan ulang: semua objek dibuat IF NOT EXISTS, kolom ditambah bila
-- belum ada, policy anon-terbuka v4 di-drop dulu sebelum policy per-user dibuat.
-- TIDAK ADA policy anon-terbuka di file ini. Semua tabel: auth.uid() = user_id.

create extension if not exists "pgcrypto";

-- ============ Tabel ============

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  telegram_chat_id text,
  created_at timestamptz default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  handle text not null,
  niche text,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text default 'Home',
  price numeric default 0,
  commission_pct numeric default 0,
  commission_rp numeric default 0,
  sold_7d integer default 0,
  viral_score integer default 80,
  competitor_hook text,
  source_url text,
  is_winning boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.atm_scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  angle_type text,
  hook_0_3s text,
  body_3_15s text,
  demo_15_25s text,
  cta_25_30s text,
  viral_score integer,
  source text default 'local',
  created_at timestamptz default now()
);

create table if not exists public.video_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  product_name text,
  character_name text,
  target_account text,
  schedule_time text,
  status text default 'DRAFT',
  est_views text,
  hook_script text,
  body_script text,
  demo_script text,
  cta_script text,
  created_at timestamptz default now()
);

create table if not exists public.financial_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  snapshot_date date not null,
  commission_rp numeric default 0,
  orders integer default 0,
  views integer default 0,
  created_at timestamptz default now(),
  unique (user_id, snapshot_date)
);

-- ============ Idempotent: tambah user_id ke tabel v4 lama bila belum ada ============

do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'products'
                 and column_name = 'user_id') then
    alter table public.products add column user_id uuid references auth.users(id) on delete cascade;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'video_queue'
                 and column_name = 'user_id') then
    alter table public.video_queue add column user_id uuid references auth.users(id) on delete cascade;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'atm_scripts'
                 and column_name = 'user_id') then
    alter table public.atm_scripts add column user_id uuid references auth.users(id) on delete cascade;
  end if;
  -- Kolom baru v5 (aman bila sudah ada)
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'products'
                 and column_name = 'source_url') then
    alter table public.products add column source_url text;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'products'
                 and column_name = 'is_winning') then
    alter table public.products add column is_winning boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'atm_scripts'
                 and column_name = 'product_id') then
    alter table public.atm_scripts add column product_id uuid references public.products(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'atm_scripts'
                 and column_name = 'source') then
    alter table public.atm_scripts add column source text default 'local';
  end if;
end $$;

-- Status video_queue v4 ('Scheduled'/'Published'/'Processing'/'Failed')
-- dipetakan ke enum V5 saat dibaca aplikasi; tidak diubah di DB.

-- ============ RLS: nyalakan + drop policy anon-terbuka v4 + buat policy per-user ============

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.products enable row level security;
alter table public.atm_scripts enable row level security;
alter table public.video_queue enable row level security;
alter table public.financial_snapshots enable row level security;

do $$
declare t text;
begin
  foreach t in array array['products','video_queue','atm_scripts'] loop
    -- Drop policy terbuka v4: "nex_all_<tabel>" untuk anon using (true)
    execute format('drop policy if exists "nex_all_%1$s" on public.%1$s', t);
  end loop;
end $$;

-- profiles: user hanya bisa baca/ubah profilnya sendiri
drop policy if exists "profiles_owner" on public.profiles;
create policy "profiles_owner" on public.profiles
  for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- accounts / products / atm_scripts / video_queue / financial_snapshots:
-- user hanya bisa akses baris dengan user_id = dirinya sendiri
drop policy if exists "accounts_owner" on public.accounts;
create policy "accounts_owner" on public.accounts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "products_owner" on public.products;
create policy "products_owner" on public.products
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "atm_scripts_owner" on public.atm_scripts;
create policy "atm_scripts_owner" on public.atm_scripts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "video_queue_owner" on public.video_queue;
create policy "video_queue_owner" on public.video_queue
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "financial_snapshots_owner" on public.financial_snapshots;
create policy "financial_snapshots_owner" on public.financial_snapshots
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ Trigger: buat profiles otomatis saat user baru daftar ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
