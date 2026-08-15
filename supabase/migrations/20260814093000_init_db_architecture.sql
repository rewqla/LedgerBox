create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create schema if not exists coins;
create schema if not exists bonds;

comment on schema coins is 'Coins domain schema for the shared collection MVP.';
comment on schema bonds is 'Reserved schema for the future OVDP domain.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email extensions.citext not null unique,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_email_not_blank check (btrim(email::text) <> '')
);

create trigger set_public_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.is_allowed_user(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = target_user_id
  );
$$;

create table if not exists coins.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  name extensions.citext not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_not_blank check (btrim(name::text) <> '')
);

create trigger set_coins_categories_updated_at
before update on coins.categories
for each row
execute function public.set_updated_at();

create table if not exists coins.coins (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  mint_year integer,
  acquired_at date not null,
  purchase_amount numeric(12, 2) not null,
  purchase_currency text not null,
  fx_usd_rate numeric(12, 6) not null,
  category_id uuid not null references coins.categories (id) on delete restrict,
  is_precious boolean not null default false,
  precious_metal_type text,
  precious_metal_weight_g numeric(12, 3),
  obverse_photo_path text,
  reverse_photo_path text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint coins_name_not_blank check (btrim(name) <> ''),
  constraint coins_mint_year_check check (mint_year is null or mint_year between 1000 and 9999),
  constraint coins_purchase_amount_nonnegative_check check (purchase_amount >= 0),
  constraint coins_purchase_currency_check check (purchase_currency in ('UAH', 'USD', 'EUR')),
  constraint coins_fx_usd_rate_positive_check check (fx_usd_rate > 0),
  constraint coins_precious_metal_type_check check (
    precious_metal_type is null or precious_metal_type in ('gold', 'silver', 'platinum')
  ),
  constraint coins_precious_metal_weight_positive_check check (
    precious_metal_weight_g is null or precious_metal_weight_g > 0
  ),
  constraint coins_precious_fields_check check (
    (
      is_precious = false
      and precious_metal_type is null
      and precious_metal_weight_g is null
    )
    or
    (
      is_precious = true
      and precious_metal_type is not null
      and precious_metal_weight_g is not null
    )
  ),
  constraint coins_obverse_photo_path_check check (
    obverse_photo_path is null or obverse_photo_path ~ '^[0-9a-fA-F-]{36}/obverse\.webp$'
  ),
  constraint coins_reverse_photo_path_check check (
    reverse_photo_path is null or reverse_photo_path ~ '^[0-9a-fA-F-]{36}/reverse\.webp$'
  ),
  constraint coins_photo_paths_not_blank_check check (
    obverse_photo_path is null or btrim(obverse_photo_path) <> ''
  ),
  constraint coins_photo_paths_not_blank_reverse_check check (
    reverse_photo_path is null or btrim(reverse_photo_path) <> ''
  ),
  constraint coins_distinct_photo_paths_check check (
    obverse_photo_path is null
    or reverse_photo_path is null
    or obverse_photo_path <> reverse_photo_path
  )
);

create index coins_by_category_idx on coins.coins (category_id);
create index coins_by_acquired_at_idx on coins.coins (acquired_at desc);
create index coins_by_mint_year_idx on coins.coins (mint_year);
create index coins_by_precious_idx on coins.coins (is_precious, precious_metal_type);

create trigger set_coins_coins_updated_at
before update on coins.coins
for each row
execute function public.set_updated_at();

create table if not exists coins.wishlist_items (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  url text not null,
  expected_price numeric(12, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint wishlist_name_not_blank check (btrim(name) <> ''),
  constraint wishlist_url_not_blank check (btrim(url) <> ''),
  constraint wishlist_url_http_check check (url ~* '^https?://'),
  constraint wishlist_expected_price_nonnegative_check check (
    expected_price is null or expected_price >= 0
  )
);

create trigger set_coins_wishlist_items_updated_at
before update on coins.wishlist_items
for each row
execute function public.set_updated_at();

grant usage on schema public to authenticated, service_role;
grant usage on schema coins to authenticated, service_role;
grant usage on schema bonds to authenticated, service_role;

grant select on public.profiles to authenticated, service_role;
grant select, insert, update, delete on coins.categories to authenticated, service_role;
grant select, insert, update, delete on coins.coins to authenticated, service_role;
grant select, insert, update, delete on coins.wishlist_items to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table coins.categories enable row level security;
alter table coins.categories force row level security;
alter table coins.coins enable row level security;
alter table coins.coins force row level security;
alter table coins.wishlist_items enable row level security;
alter table coins.wishlist_items force row level security;

create policy "profiles_select_own_row"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "categories_select_for_allowed_users"
on coins.categories
for select
to authenticated
using (public.is_allowed_user());

create policy "categories_insert_for_allowed_users"
on coins.categories
for insert
to authenticated
with check (public.is_allowed_user());

create policy "categories_update_for_allowed_users"
on coins.categories
for update
to authenticated
using (public.is_allowed_user())
with check (public.is_allowed_user());

create policy "categories_delete_for_allowed_users"
on coins.categories
for delete
to authenticated
using (public.is_allowed_user());

create policy "coins_select_for_allowed_users"
on coins.coins
for select
to authenticated
using (public.is_allowed_user());

create policy "coins_insert_for_allowed_users"
on coins.coins
for insert
to authenticated
with check (public.is_allowed_user());

create policy "coins_update_for_allowed_users"
on coins.coins
for update
to authenticated
using (public.is_allowed_user())
with check (public.is_allowed_user());

create policy "coins_delete_for_allowed_users"
on coins.coins
for delete
to authenticated
using (public.is_allowed_user());

create policy "wishlist_select_for_allowed_users"
on coins.wishlist_items
for select
to authenticated
using (public.is_allowed_user());

create policy "wishlist_insert_for_allowed_users"
on coins.wishlist_items
for insert
to authenticated
with check (public.is_allowed_user());

create policy "wishlist_update_for_allowed_users"
on coins.wishlist_items
for update
to authenticated
using (public.is_allowed_user())
with check (public.is_allowed_user());

create policy "wishlist_delete_for_allowed_users"
on coins.wishlist_items
for delete
to authenticated
using (public.is_allowed_user());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('coin-photos', 'coin-photos', false, 1048576, array['image/webp']::text[])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "coin_photos_select_for_allowed_users"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'coin-photos'
  and public.is_allowed_user()
);

create policy "coin_photos_insert_for_allowed_users"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'coin-photos'
  and public.is_allowed_user()
  and name ~ '^[0-9a-fA-F-]{36}/(obverse|reverse)\.webp$'
);

create policy "coin_photos_update_for_allowed_users"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'coin-photos'
  and public.is_allowed_user()
)
with check (
  bucket_id = 'coin-photos'
  and public.is_allowed_user()
  and name ~ '^[0-9a-fA-F-]{36}/(obverse|reverse)\.webp$'
);

create policy "coin_photos_delete_for_allowed_users"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'coin-photos'
  and public.is_allowed_user()
);
