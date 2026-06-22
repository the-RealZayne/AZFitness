-- AZFitness local-PIN cloud sync table.
-- Apply this in the Supabase SQL editor for project seydmsgmgwmoxzxyrwgb.
-- It stores each athlete's app snapshot as JSONB and gates browser access with
-- a per-profile sync hash sent in the x-az-sync-hash header.

create table if not exists public.azfitness_sync (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  profile_name text not null,
  sync_hash text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (profile_id, sync_hash)
);

alter table public.azfitness_sync enable row level security;

create policy "azfitness sync read by sync hash"
  on public.azfitness_sync
  for select
  to anon, authenticated
  using (
    sync_hash = coalesce(
      nullif(current_setting('request.headers', true)::jsonb ->> 'x-az-sync-hash', ''),
      'no-sync-hash'
    )
  );

create policy "azfitness sync insert by sync hash"
  on public.azfitness_sync
  for insert
  to anon, authenticated
  with check (
    sync_hash = coalesce(
      nullif(current_setting('request.headers', true)::jsonb ->> 'x-az-sync-hash', ''),
      'no-sync-hash'
    )
  );

create policy "azfitness sync update by sync hash"
  on public.azfitness_sync
  for update
  to anon, authenticated
  using (
    sync_hash = coalesce(
      nullif(current_setting('request.headers', true)::jsonb ->> 'x-az-sync-hash', ''),
      'no-sync-hash'
    )
  )
  with check (
    sync_hash = coalesce(
      nullif(current_setting('request.headers', true)::jsonb ->> 'x-az-sync-hash', ''),
      'no-sync-hash'
    )
  );

create or replace function public.set_azfitness_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists azfitness_sync_updated_at on public.azfitness_sync;
create trigger azfitness_sync_updated_at
before update on public.azfitness_sync
for each row execute function public.set_azfitness_updated_at();
