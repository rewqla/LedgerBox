import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb } from '../../helpers/postgres.js';

const REQUIRED_CONSTRAINTS = [
  'profiles_email_not_blank',
  'categories_name_not_blank',
  'coins_name_not_blank',
  'coins_mint_year_check',
  'coins_purchase_amount_nonnegative_check',
  'coins_purchase_currency_check',
  'coins_fx_usd_rate_positive_check',
  'coins_precious_metal_type_check',
  'coins_precious_metal_weight_positive_check',
  'coins_precious_fields_check',
  'coins_obverse_photo_path_check',
  'coins_reverse_photo_path_check',
  'coins_photo_paths_not_blank_check',
  'coins_photo_paths_not_blank_reverse_check',
  'coins_distinct_photo_paths_check',
  'wishlist_name_not_blank',
  'wishlist_url_not_blank',
  'wishlist_url_http_check',
  'wishlist_expected_price_nonnegative_check'
];

const REQUIRED_POLICIES = [
  ['public', 'profiles', 'profiles_select_own_row'],
  ['coins', 'categories', 'categories_select_for_allowed_users'],
  ['coins', 'categories', 'categories_insert_for_allowed_users'],
  ['coins', 'categories', 'categories_update_for_allowed_users'],
  ['coins', 'categories', 'categories_delete_for_allowed_users'],
  ['coins', 'coins', 'coins_select_for_allowed_users'],
  ['coins', 'coins', 'coins_insert_for_allowed_users'],
  ['coins', 'coins', 'coins_update_for_allowed_users'],
  ['coins', 'coins', 'coins_delete_for_allowed_users'],
  ['coins', 'wishlist_items', 'wishlist_select_for_allowed_users'],
  ['coins', 'wishlist_items', 'wishlist_insert_for_allowed_users'],
  ['coins', 'wishlist_items', 'wishlist_update_for_allowed_users'],
  ['coins', 'wishlist_items', 'wishlist_delete_for_allowed_users'],
  ['storage', 'objects', 'coin_photos_select_for_allowed_users'],
  ['storage', 'objects', 'coin_photos_insert_for_allowed_users'],
  ['storage', 'objects', 'coin_photos_update_for_allowed_users'],
  ['storage', 'objects', 'coin_photos_delete_for_allowed_users']
];

describe('database architecture and migrations', () => {
  const db = createTestDb();

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.end();
  });

  it('creates reserved schemas and core tables', async () => {
    const schemasResult = await db.query(`
      select nspname
      from pg_namespace
      where nspname in ('coins', 'bonds')
      order by nspname
    `);

    expect(schemasResult.rows.map((row) => row.nspname)).toEqual(['bonds', 'coins']);

    const tablesResult = await db.query(`
      select table_schema, table_name
      from information_schema.tables
      where (table_schema, table_name) in (
        ('public', 'profiles'),
        ('coins', 'categories'),
        ('coins', 'coins'),
        ('coins', 'wishlist_items')
      )
      order by table_schema, table_name
    `);

    expect(tablesResult.rows).toHaveLength(4);
  });

  it('does not introduce owner_id columns or cross-domain foreign keys', async () => {
    const ownerColumnsResult = await db.query(`
      select table_schema, table_name
      from information_schema.columns
      where table_schema in ('coins', 'bonds')
        and column_name = 'owner_id'
    `);

    expect(ownerColumnsResult.rows).toEqual([]);

    const crossDomainFkResult = await db.query(`
      select
        source_ns.nspname as source_schema,
        target_ns.nspname as target_schema
      from pg_constraint constraint_def
      join pg_class source_table on source_table.oid = constraint_def.conrelid
      join pg_namespace source_ns on source_ns.oid = source_table.relnamespace
      join pg_class target_table on target_table.oid = constraint_def.confrelid
      join pg_namespace target_ns on target_ns.oid = target_table.relnamespace
      where constraint_def.contype = 'f'
        and source_ns.nspname in ('coins', 'bonds')
        and target_ns.nspname in ('coins', 'bonds')
        and source_ns.nspname <> target_ns.nspname
    `);

    expect(crossDomainFkResult.rows).toEqual([]);
  });

  it('enforces the expected SQL constraints', async () => {
    const constraintsResult = await db.query(`
      select conname
      from pg_constraint
      where conname = any($1::text[])
      order by conname
    `, [REQUIRED_CONSTRAINTS]);

    expect(constraintsResult.rows.map((row) => row.conname).sort()).toEqual(
      [...REQUIRED_CONSTRAINTS].sort()
    );
  });

  it('enables RLS and installs the required policies', async () => {
    const rlsResult = await db.query(`
      select ns.nspname as schema_name, cls.relname as table_name, cls.relrowsecurity
      from pg_class cls
      join pg_namespace ns on ns.oid = cls.relnamespace
      where (ns.nspname, cls.relname) in (
        ('public', 'profiles'),
        ('coins', 'categories'),
        ('coins', 'coins'),
        ('coins', 'wishlist_items')
      )
      order by ns.nspname, cls.relname
    `);

    expect(rlsResult.rows.every((row) => row.relrowsecurity)).toBe(true);

    const policiesResult = await db.query(`
      select schemaname, tablename, policyname
      from pg_policies
      where (schemaname, tablename, policyname) in (
        ('public', 'profiles', 'profiles_select_own_row'),
        ('coins', 'categories', 'categories_select_for_allowed_users'),
        ('coins', 'categories', 'categories_insert_for_allowed_users'),
        ('coins', 'categories', 'categories_update_for_allowed_users'),
        ('coins', 'categories', 'categories_delete_for_allowed_users'),
        ('coins', 'coins', 'coins_select_for_allowed_users'),
        ('coins', 'coins', 'coins_insert_for_allowed_users'),
        ('coins', 'coins', 'coins_update_for_allowed_users'),
        ('coins', 'coins', 'coins_delete_for_allowed_users'),
        ('coins', 'wishlist_items', 'wishlist_select_for_allowed_users'),
        ('coins', 'wishlist_items', 'wishlist_insert_for_allowed_users'),
        ('coins', 'wishlist_items', 'wishlist_update_for_allowed_users'),
        ('coins', 'wishlist_items', 'wishlist_delete_for_allowed_users'),
        ('storage', 'objects', 'coin_photos_select_for_allowed_users'),
        ('storage', 'objects', 'coin_photos_insert_for_allowed_users'),
        ('storage', 'objects', 'coin_photos_update_for_allowed_users'),
        ('storage', 'objects', 'coin_photos_delete_for_allowed_users')
      )
      order by schemaname, tablename, policyname
    `);

    expect(
      policiesResult.rows.map((row) => [row.schemaname, row.tablename, row.policyname]).sort()
    ).toEqual([...REQUIRED_POLICIES].sort());
  });

  it('seeds the default categories and configures the private photo bucket', async () => {
    const categoriesResult = await db.query(`
      select name::text
      from coins.categories
      where name in ('українська', 'закордонна')
      order by name
    `);

    expect(categoriesResult.rows.map((row) => row.name)).toEqual([
      'закордонна',
      'українська'
    ]);

    const bucketResult = await db.query(`
      select id, public, file_size_limit, allowed_mime_types
      from storage.buckets
      where id = 'coin-photos'
    `);

    expect(bucketResult.rows).toHaveLength(1);
    expect(bucketResult.rows[0].public).toBe(false);
    expect(Number(bucketResult.rows[0].file_size_limit)).toBe(1048576);
    expect(bucketResult.rows[0].allowed_mime_types).toEqual(['image/webp']);
  });
});
