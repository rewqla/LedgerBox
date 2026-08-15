import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb } from '../../helpers/postgres.js';

describe('categories CRUD flow', () => {
  const db = createTestDb();

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.end();
  });

  it('creates, updates and deletes category records', async () => {
    const insertResult = await db.query(
      `
        insert into coins.categories (name)
        values ($1)
        returning id, name
      `,
      ['Тестова категорія']
    );

    expect(insertResult.rows).toHaveLength(1);
    expect(insertResult.rows[0].name).toBe('Тестова категорія');

    const categoryId = insertResult.rows[0].id;

    const updateResult = await db.query(
      `
        update coins.categories
        set name = $2
        where id = $1
        returning name
      `,
      [categoryId, 'Оновлена категорія']
    );

    expect(updateResult.rows).toHaveLength(1);
    expect(updateResult.rows[0].name).toBe('Оновлена категорія');

    await db.query('delete from coins.categories where id = $1', [categoryId]);

    const existsResult = await db.query(
      `
        select id
        from coins.categories
        where id = $1
      `,
      [categoryId]
    );

    expect(existsResult.rows).toEqual([]);
  });
});
