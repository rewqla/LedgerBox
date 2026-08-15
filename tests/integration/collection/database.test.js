import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb } from '../../helpers/postgres.js';

describe('coins CRUD and photo slot schema', () => {
  const db = createTestDb();
  let categoryId;

  beforeAll(async () => {
    await db.connect();
    const categoryResult = await db.query(
      `
        insert into coins.categories (name)
        values ($1)
        returning id
      `,
      ['CRUD категорія монет']
    );

    categoryId = categoryResult.rows[0].id;
  });

  afterAll(async () => {
    if (categoryId) {
      await db.query('delete from coins.categories where id = $1', [categoryId]);
    }

    await db.end();
  });

  it('supports create, update and delete with exactly two photo slots', async () => {
    const insertResult = await db.query(
      `
        insert into coins.coins (
          name,
          mint_year,
          acquired_at,
          purchase_amount,
          purchase_currency,
          fx_usd_rate,
          category_id,
          is_precious,
          notes
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning id, obverse_photo_path, reverse_photo_path
      `,
      [
        'Тестова монета',
        2024,
        '2026-08-15',
        150,
        'USD',
        1,
        categoryId,
        false,
        'created in integration test'
      ]
    );

    expect(insertResult.rows).toHaveLength(1);
    expect(insertResult.rows[0].obverse_photo_path).toBeNull();
    expect(insertResult.rows[0].reverse_photo_path).toBeNull();

    const coinId = insertResult.rows[0].id;

    const updateResult = await db.query(
      `
        update coins.coins
        set
          obverse_photo_path = $2,
          reverse_photo_path = $3,
          notes = $4
        where id = $1
        returning obverse_photo_path, reverse_photo_path, notes
      `,
      [coinId, `${coinId}/obverse.webp`, `${coinId}/reverse.webp`, 'updated']
    );

    expect(updateResult.rows).toHaveLength(1);
    expect(updateResult.rows[0].obverse_photo_path).toBe(`${coinId}/obverse.webp`);
    expect(updateResult.rows[0].reverse_photo_path).toBe(`${coinId}/reverse.webp`);
    expect(updateResult.rows[0].notes).toBe('updated');

    const columnResult = await db.query(
      `
        select column_name
        from information_schema.columns
        where table_schema = 'coins'
          and table_name = 'coins'
          and column_name like '%photo_path%'
        order by column_name
      `
    );

    expect(columnResult.rows.map((row) => row.column_name)).toEqual([
      'obverse_photo_path',
      'reverse_photo_path'
    ]);

    await db.query('delete from coins.coins where id = $1', [coinId]);

    const existsResult = await db.query(
      `
        select id
        from coins.coins
        where id = $1
      `,
      [coinId]
    );

    expect(existsResult.rows).toEqual([]);
  });
});
