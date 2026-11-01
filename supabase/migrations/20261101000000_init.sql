-- FareBuddy — BIT Patna
-- Initial schema: auth domain enforcement, profiles, delivery pools, ride pools,
-- gear bazaar, RLS, atomic RPCs, realtime, storage, and reference data.
--
-- Run this migration once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto" with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'delivery_pool_status') then
    create type public.delivery_pool_status as enum ('open', 'locked', 'ordered', 'settled');
  end if;
  if not exists (select 1 from pg_type where typname = 'ride_pool_status') then
    create type public.ride_pool_status as enum ('open', 'full', 'completed', 'cancelled');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  hostel text check (hostel is null or hostel in ('BH-1', 'BH-2', 'BH-3', 'GH')),
  wing text,
  room text,
  upi_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hubs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  distance_km numeric(5, 1) not null check (distance_km >= 0),
  solo_fare integer not null check (solo_fare >= 0)
);

create table if not exists public.delivery_pools (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  hostel text not null,
  wing text not null,
  platform text not null check (platform in ('Blinkit', 'Zepto', 'Instamart')),
  threshold integer not null default 149 check (threshold > 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  small_order_fee integer not null default 0 check (small_order_fee >= 0),
  handling_fee integer not null default 0 check (handling_fee >= 0),
  current_total integer not null default 0 check (current_total >= 0),
  status public.delivery_pool_status not null default 'open',
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_pool_items (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.delivery_pools (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_name text not null check (char_length(trim(item_name)) between 1 and 80),
  price integer not null check (price > 0),
  qty integer not null default 1 check (qty between 1 and 99),
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ride_pools (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid not null references public.hubs (id) on delete restrict,
  host_id uuid not null references public.profiles (id) on delete cascade,
  departure_start timestamptz not null,
  departure_end timestamptz not null,
  max_seats integer not null default 4 check (max_seats between 2 and 6),
  booked_seats integer not null default 1 check (booked_seats >= 0),
  meeting_point text not null default 'Main Gate'
    check (meeting_point in ('Main Gate', 'ICICI Gate')),
  whatsapp_link text,
  status public.ride_pool_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint ride_window_valid check (departure_end > departure_start),
  constraint ride_seats_valid check (booked_seats <= max_seats)
);

create table if not exists public.ride_pool_members (
  id uuid primary key default gen_random_uuid(),
  ride_pool_id uuid not null references public.ride_pools (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (ride_pool_id, user_id)
);

create table if not exists public.gear_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 80),
  category text not null check (category in ('ED/Drafting', 'Workshop', 'Electronics', 'Other')),
  description text not null default '',
  price integer not null check (price > 0 and price <= 400),
  condition text not null check (condition in ('Like new', 'Good', 'Used')),
  seller_hostel text not null,
  seller_room text,
  handoff_window text not null,
  photo_url text,
  claimed_by uuid references public.profiles (id) on delete set null,
  claimed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.impact_baseline (
  id text primary key default 'campus',
  baseline_savings integer not null default 0 check (baseline_savings >= 0),
  baseline_rides integer not null default 0 check (baseline_rides >= 0),
  baseline_orders integer not null default 0 check (baseline_orders >= 0),
  baseline_gear integer not null default 0 check (baseline_gear >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists delivery_pools_status_idx on public.delivery_pools (status, expires_at);
create index if not exists delivery_pools_host_idx on public.delivery_pools (host_id);
create index if not exists delivery_pool_items_pool_idx on public.delivery_pool_items (pool_id);
create index if not exists delivery_pool_items_user_idx on public.delivery_pool_items (user_id);
create index if not exists ride_pools_hub_idx on public.ride_pools (hub_id, departure_start);
create index if not exists ride_pools_status_idx on public.ride_pools (status);
create index if not exists ride_pools_host_idx on public.ride_pools (host_id);
create index if not exists ride_pool_members_pool_idx on public.ride_pool_members (ride_pool_id);
create index if not exists ride_pool_members_user_idx on public.ride_pool_members (user_id);
create index if not exists gear_listings_category_idx on public.gear_listings (category, claimed);
create index if not exists gear_listings_seller_idx on public.gear_listings (seller_id);
create index if not exists profiles_hostel_idx on public.profiles (hostel);

-- ---------------------------------------------------------------------------
-- Auth enforcement: only current BIT Patna student IDs may sign up.
-- This runs inside Postgres, so it cannot be bypassed by the client.
-- ---------------------------------------------------------------------------

create or replace function public.enforce_bit_patna_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null
     or new.email !~* '^btech15[0-9]{3}\.[0-9]{2}@bitmesra\.ac\.in$' then
    raise exception 'Registration restricted to valid BIT Patna student IDs'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_bit_patna_email on auth.users;
create trigger enforce_bit_patna_email
  before insert or update of email on auth.users
  for each row execute function public.enforce_bit_patna_email();

-- Auto-create a skeleton profile, then onboarding fills the rest.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_profile_updated_at();

-- The profile email always mirrors the verified auth email, so a student cannot
-- edit their way around the BIT Patna domain check.
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select u.email into new.email
    from auth.users u
   where u.id = new.id;

  if new.email is null then
    raise exception 'Profile must belong to a registered student';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_email on public.profiles;
create trigger profiles_sync_email
  before insert or update of email on public.profiles
  for each row execute function public.sync_profile_email();

-- ---------------------------------------------------------------------------
-- Delivery pool totals are always derived from line items, never trusted
-- from the client. A single trigger keeps current_total accurate.
-- ---------------------------------------------------------------------------

create or replace function public.recalculate_delivery_total(p_pool_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.delivery_pools
  set current_total = coalesce(
    (select sum(i.price * i.qty)::int
       from public.delivery_pool_items i
      where i.pool_id = p_pool_id),
    0
  )
  where id = p_pool_id;
end;
$$;

create or replace function public.sync_delivery_total_on_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_delivery_total(old.pool_id);
  else
    perform public.recalculate_delivery_total(new.pool_id);
    if tg_op = 'UPDATE' and old.pool_id is distinct from new.pool_id then
      perform public.recalculate_delivery_total(old.pool_id);
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists delivery_items_sync_total on public.delivery_pool_items;
create trigger delivery_items_sync_total
  after insert or update or delete on public.delivery_pool_items
  for each row execute function public.sync_delivery_total_on_item();

-- Line items can only be altered while the pool is open. After locking, the
-- only allowed change is the host/steward marking a line as paid.
create or replace function public.guard_locked_item_edits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pool_status public.delivery_pool_status;
begin
  if (new.item_name, new.price, new.qty, new.pool_id, new.user_id)
     is distinct from
     (old.item_name, old.price, old.qty, old.pool_id, old.user_id) then
    select status into pool_status
      from public.delivery_pools
     where id = old.pool_id;

    if pool_status is distinct from 'open' then
      raise exception 'This pool is locked — line items can no longer change';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists delivery_items_guard_locked on public.delivery_pool_items;
create trigger delivery_items_guard_locked
  before update on public.delivery_pool_items
  for each row execute function public.guard_locked_item_edits();

create or replace function public.force_delivery_pool_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    new.current_total := coalesce(
      (select sum(i.price * i.qty)::int
         from public.delivery_pool_items i
        where i.pool_id = new.id),
      0
    );
  else
    new.current_total := 0;
  end if;
  return new;
end;
$$;

drop trigger if exists delivery_pool_force_total on public.delivery_pools;
create trigger delivery_pool_force_total
  before insert or update on public.delivery_pools
  for each row execute function public.force_delivery_pool_total();

-- ---------------------------------------------------------------------------
-- Ride pools: host is auto-added as the first rider.
-- ---------------------------------------------------------------------------

create or replace function public.add_ride_pool_host()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ride_pool_members (ride_pool_id, user_id)
  values (new.id, new.host_id)
  on conflict (ride_pool_id, user_id) do nothing;

  if new.booked_seats < 1 then
    update public.ride_pools set booked_seats = 1 where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists ride_pool_add_host on public.ride_pools;
create trigger ride_pool_add_host
  after insert on public.ride_pools
  for each row execute function public.add_ride_pool_host();

-- Atomic guest join. Locks the pool row so two students cannot oversell seats.
create or replace function public.join_ride_pool(p_pool_id uuid)
returns public.ride_pools
language plpgsql
security definer
set search_path = public
as $$
declare
  pool public.ride_pools;
begin
  if auth.uid() is null then
    raise exception 'Sign in to join a ride pool';
  end if;

  select * into pool
    from public.ride_pools
   where id = p_pool_id
   for update;

  if not found then
    raise exception 'Ride pool not found';
  end if;

  if pool.status <> 'open' then
    raise exception 'This ride pool is no longer open';
  end if;

  if pool.booked_seats >= pool.max_seats then
    raise exception 'Pool full — try another window';
  end if;

  if exists (
    select 1 from public.ride_pool_members
     where ride_pool_id = p_pool_id and user_id = auth.uid()
  ) then
    raise exception 'You are already in this pool';
  end if;

  insert into public.ride_pool_members (ride_pool_id, user_id)
  values (p_pool_id, auth.uid());

  update public.ride_pools
     set booked_seats = booked_seats + 1,
         status = case
           when booked_seats + 1 >= max_seats then 'full'::public.ride_pool_status
           else 'open'::public.ride_pool_status
         end
   where id = p_pool_id
   returning * into pool;

  return pool;
end;
$$;

create or replace function public.leave_ride_pool(p_pool_id uuid)
returns public.ride_pools
language plpgsql
security definer
set search_path = public
as $$
declare
  pool public.ride_pools;
begin
  if auth.uid() is null then
    raise exception 'Sign in to leave a ride pool';
  end if;

  select * into pool
    from public.ride_pools
   where id = p_pool_id
   for update;

  if not found then
    raise exception 'Ride pool not found';
  end if;

  if pool.host_id = auth.uid() then
    raise exception 'Hosts cannot leave their own pool — cancel it instead';
  end if;

  if not exists (
    select 1 from public.ride_pool_members
     where ride_pool_id = p_pool_id and user_id = auth.uid()
  ) then
    raise exception 'You are not in this pool';
  end if;

  delete from public.ride_pool_members
   where ride_pool_id = p_pool_id and user_id = auth.uid();

  update public.ride_pools
     set booked_seats = greatest(0, booked_seats - 1),
         status = case
           when status = 'full' then 'open'::public.ride_pool_status
           else status
         end
   where id = p_pool_id
   returning * into pool;

  return pool;
end;
$$;

-- Atomic one-person gear claim.
create or replace function public.claim_gear_listing(p_listing_id uuid)
returns public.gear_listings
language plpgsql
security definer
set search_path = public
as $$
declare
  listing public.gear_listings;
begin
  if auth.uid() is null then
    raise exception 'Sign in to claim an item';
  end if;

  update public.gear_listings
     set claimed = true,
         claimed_by = auth.uid()
   where id = p_listing_id
     and claimed = false
     and seller_id <> auth.uid()
   returning * into listing;

  if not found then
    raise exception 'This item is already claimed or unavailable';
  end if;

  return listing;
end;
$$;

revoke all on function public.join_ride_pool(uuid) from public;
revoke all on function public.leave_ride_pool(uuid) from public;
revoke all on function public.claim_gear_listing(uuid) from public;
grant execute on function public.join_ride_pool(uuid) to authenticated;
grant execute on function public.leave_ride_pool(uuid) to authenticated;
grant execute on function public.claim_gear_listing(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.hubs enable row level security;
alter table public.delivery_pools enable row level security;
alter table public.delivery_pool_items enable row level security;
alter table public.ride_pools enable row level security;
alter table public.ride_pool_members enable row level security;
alter table public.gear_listings enable row level security;
alter table public.impact_baseline enable row level security;

-- Profiles: everyone signed in can resolve names and UPI IDs for settlements;
-- only the owner can create or edit their row.
create policy "profiles readable by authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles insert own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Reference data: read-only to students.
create policy "hubs readable by authenticated"
  on public.hubs for select
  to authenticated
  using (true);

create policy "impact baseline readable by authenticated"
  on public.impact_baseline for select
  to authenticated
  using (true);

-- Delivery pools: all authenticated students can browse. Only the host can
-- edit settings, lock, mark ordered, or settle.
create policy "delivery pools readable"
  on public.delivery_pools for select
  to authenticated
  using (true);

create policy "delivery pools insert own"
  on public.delivery_pools for insert
  to authenticated
  with check (host_id = auth.uid());

create policy "delivery pools update host"
  on public.delivery_pools for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "delivery pools delete host"
  on public.delivery_pools for delete
  to authenticated
  using (host_id = auth.uid());

-- Delivery items: live line items are visible to everyone. Students can add
-- items to open, unexpired pools; they can edit/delete their own lines. The
-- host can also mark paid flags on any line in their pool.
create policy "delivery items readable"
  on public.delivery_pool_items for select
  to authenticated
  using (true);

create policy "delivery items insert own in open pool"
  on public.delivery_pool_items for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.delivery_pools p
       where p.id = pool_id
         and p.status = 'open'
         and p.expires_at > now()
    )
  );

create policy "delivery items update own or host"
  on public.delivery_pool_items for update
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.delivery_pools p
       where p.id = pool_id and p.host_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.delivery_pools p
       where p.id = pool_id and p.host_id = auth.uid()
    )
  );

create policy "delivery items delete own or host"
  on public.delivery_pool_items for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.delivery_pools p
       where p.id = pool_id and p.host_id = auth.uid()
    )
  );

-- Ride pools: browse all; host creates and edits logistics. Joining and
-- leaving go through the SECURITY DEFINER RPCs above for seat safety.
create policy "ride pools readable"
  on public.ride_pools for select
  to authenticated
  using (true);

create policy "ride pools insert own"
  on public.ride_pools for insert
  to authenticated
  with check (host_id = auth.uid() and booked_seats = 1);

create policy "ride pools update host"
  on public.ride_pools for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "ride pools delete host"
  on public.ride_pools for delete
  to authenticated
  using (host_id = auth.uid());

create policy "ride members readable"
  on public.ride_pool_members for select
  to authenticated
  using (true);

-- Gear: browse everything, sellers manage their own listings. Claims go
-- through claim_gear_listing() so only one student can win.
create policy "gear readable"
  on public.gear_listings for select
  to authenticated
  using (true);

create policy "gear insert own"
  on public.gear_listings for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and claimed = false
    and claimed_by is null
    and price <= 400
  );

create policy "gear update own"
  on public.gear_listings for update
  to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "gear delete own"
  on public.gear_listings for delete
  to authenticated
  using (seller_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Live campus totals = seeded baseline + live completed activity.
-- ---------------------------------------------------------------------------

create or replace view public.impact_totals
with (security_invoker = true) as
select
  b.baseline_savings + coalesce(d.savings, 0) + coalesce(r.savings, 0) as campus_savings,
  b.baseline_rides + coalesce(r.rides, 0) as rides_shared,
  b.baseline_orders + coalesce(d.orders, 0) as orders_pooled,
  b.baseline_gear + coalesce(g.items, 0) as gear_resold
from (
  select * from public.impact_baseline where id = 'campus'
) b
left join (
  select
    coalesce(sum(
      case
        when status in ('ordered', 'settled') and current_total >= threshold
          then delivery_fee + small_order_fee + handling_fee
        else 0
      end
    ), 0)::int as savings,
    count(*) filter (where status in ('ordered', 'settled'))::int as orders
  from public.delivery_pools
) d on true
left join (
  select
    coalesce(sum(
      case
        when p.status in ('full', 'completed')
          then greatest(0, h.solo_fare - ceil(h.solo_fare::numeric / greatest(p.booked_seats, 1)))
        else 0
      end
    ), 0)::int as savings,
    count(*) filter (where p.status in ('full', 'completed'))::int as rides
  from public.ride_pools p
  join public.hubs h on h.id = p.hub_id
) r on true
left join (
  select count(*) filter (where claimed)::int as items
  from public.gear_listings
) g on true;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

do $$
declare
  target text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  foreach target in array array[
    'delivery_pools',
    'delivery_pool_items',
    'ride_pools',
    'ride_pool_members',
    'gear_listings'
  ]
  loop
    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = target
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target);
    end if;
  end loop;
end
$$;

alter table public.delivery_pools replica identity full;
alter table public.delivery_pool_items replica identity full;
alter table public.ride_pools replica identity full;
alter table public.ride_pool_members replica identity full;
alter table public.gear_listings replica identity full;

-- ---------------------------------------------------------------------------
-- Storage: one public bucket for gear photos, uploads scoped to own folder.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gear-photos',
  'gear-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "gear photos public read"
  on storage.objects for select
  to public
  using (bucket_id = 'gear-photos');

create policy "gear photos owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gear-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "gear photos owner update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'gear-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'gear-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "gear photos owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gear-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Grants (RLS still applies)
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated;
grant select on public.profiles, public.hubs, public.delivery_pools,
  public.delivery_pool_items, public.ride_pools, public.ride_pool_members,
  public.gear_listings, public.impact_baseline, public.impact_totals
  to authenticated;
grant insert, update, delete on public.profiles, public.delivery_pools,
  public.delivery_pool_items, public.ride_pools, public.gear_listings
  to authenticated;

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

insert into public.hubs (id, code, name, distance_km, solo_fare)
values
  ('a1000000-0000-4000-8000-000000000001', 'RNC', 'Ranchi Jn', 16.0, 320),
  ('a1000000-0000-4000-8000-000000000002', 'HTE', 'Hatia', 24.0, 350),
  ('a1000000-0000-4000-8000-000000000003', 'TIS', 'Tatisilwai / Namkum', 10.0, 180),
  ('a1000000-0000-4000-8000-000000000004', 'IXR', 'Birsa Munda Airport', 21.0, 450)
on conflict (code) do update
  set name = excluded.name,
      distance_km = excluded.distance_km,
      solo_fare = excluded.solo_fare;

insert into public.impact_baseline (
  id, baseline_savings, baseline_rides, baseline_orders, baseline_gear
)
values ('campus', 86700, 408, 261, 96)
on conflict (id) do update
  set baseline_savings = excluded.baseline_savings,
      baseline_rides = excluded.baseline_rides,
      baseline_orders = excluded.baseline_orders,
      baseline_gear = excluded.baseline_gear,
      updated_at = now();
