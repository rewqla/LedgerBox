import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb } from '../../helpers/postgres.js';

describe('wishlist table CRUD flow', () => {
  const db = createTestDb();

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.end();
  });

  it('supports create, update and purchased/delete semantics for wishlist items', async () => {
    const insertResult = await db.query(
      `
        insert into coins.wishlist_items (name, url, expected_price)
        values ($1, $2, $3)
        returning id, name, url, expected_price
      `,
      ['Krugerrand', 'https://example.com/krugerrand', 125.5]
    );

    expect(insertResult.rows).toHaveLength(1);
    expect(insertResult.rows[0].name).toBe('Krugerrand');
    expect(insertResult.rows[0].url).toBe('https://example.com/krugerrand');
    expect(Number(insertResult.rows[0].expected_price)).toBe(125.5);

    const wishlistItemId = insertResult.rows[0].id;

    const updateResult = await db.query(
      `
        update coins.wishlist_items
        set name = $2, url = $3, expected_price = $4
        where id = $1
        returning name, url, expected_price
      `,
      [wishlistItemId, 'Krugerrand 1 oz', 'https://example.com/krugerrand-1oz', 140]
    );

    expect(updateResult.rows).toHaveLength(1);
    expect(updateResult.rows[0].name).toBe('Krugerrand 1 oz');
    expect(updateResult.rows[0].url).toBe('https://example.com/krugerrand-1oz');
    expect(Number(updateResult.rows[0].expected_price)).toBe(140);

    await db.query(
      `
        delete from coins.wishlist_items
        where id = $1
      `,
      [wishlistItemId]
    );

    const existsResult = await db.query(
      `
        select id
        from coins.wishlist_items
        where id = $1
      `,
      [wishlistItemId]
    );

    expect(existsResult.rows).toEqual([]);
  });
});
