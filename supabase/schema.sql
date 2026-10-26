-- Jalankan di Supabase → SQL Editor
create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text default 'Home',
  price numeric default 0,
  commission_pct numeric default 0,
  commission_rp numeric default 0,
  sold_7d integer default 0,
  viral_score integer default 80,
  competitor_hook text,
  created_at timestamptz default now()
);

create table if not exists public.video_queue (
  id uuid primary key default gen_random_uuid(),
  title text,
  product_name text,
  character_name text,
  target_account text,
  schedule_time text,
  status text default 'Scheduled',
  est_views text,
  hook_script text,
  body_script text,
  demo_script text,
  cta_script text,
  created_at timestamptz default now()
);

create table if not exists public.atm_scripts (
  id uuid primary key default gen_random_uuid(),
  angle_type text,
  hook_0_3s text,
  body_3_15s text,
  demo_15_25s text,
  cta_25_30s text,
  viral_score integer,
  created_at timestamptz default now()
);

alter table public.products    enable row level security;
alter table public.video_queue enable row level security;
alter table public.atm_scripts enable row level security;

-- PERINGATAN: policy di bawah mengizinkan SIAPA PUN yang punya anon key membaca & menulis.
-- Cocok untuk prototipe pribadi. Untuk produksi: aktifkan Supabase Auth dan ganti
-- "to anon" menjadi "to authenticated" dengan filter auth.uid() = user_id.
do $$
declare t text;
begin
  foreach t in array array['products','video_queue','atm_scripts'] loop
    execute format('drop policy if exists "nex_all_%1$s" on public.%1$s', t);
    execute format('create policy "nex_all_%1$s" on public.%1$s for all to anon using (true) with check (true)', t);
  end loop;
end $$;
