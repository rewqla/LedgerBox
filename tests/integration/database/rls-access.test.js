import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb } from '../../helpers/postgres.js';
import {
  cleanupAuthUser,
  createAuthUser,
  ensureProfile,
  runAsRole
} from '../../helpers/auth.js';

describe('RLS access cases', () => {
  const db = createTestDb();
  const createdUsers = [];

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    for (const user of createdUsers) {
      await cleanupAuthUser(db, user.userId);
    }

    await db.end();
  });

  it('blocks anonymous role from reading the shared collection schema', async () => {
    await expect(
      runAsRole(db, 'anon', null, async () => {
        await db.query('select id from coins.categories limit 1');
      })
    ).rejects.toThrow();
  });

  it('prevents authenticated users without profiles from reading or mutating shared collection data', async () => {
    const user = await createAuthUser(db);
    createdUsers.push(user);

    await runAsRole(db, 'authenticated', user.userId, async () => {
      const categoriesResult = await db.query('select id from coins.categories');
      expect(categoriesResult.rows).toEqual([]);
    });

    await expect(
      runAsRole(db, 'authenticated', user.userId, async () => {
        await db.query(
          `
            insert into coins.wishlist_items (name, url, expected_price)
            values ($1, $2, $3)
          `,
          ['RLS blocked coin', 'https://example.com/rls-blocked', 10]
        );
      })
    ).rejects.toThrow();
  });

  it('allows authenticated users with profiles to work with the shared collection', async () => {
    const user = await createAuthUser(db, {
      email: 'member-rls@example.com'
    });
    createdUsers.push(user);
    await ensureProfile(db, user);

    await runAsRole(db, 'authenticated', user.userId, async () => {
      const categoriesResult = await db.query('select id from coins.categories limit 1');
      expect(categoriesResult.rows.length).toBeGreaterThan(0);

      const insertResult = await db.query(
        `
          insert into coins.categories (name)
          values ($1)
          returning id
        `,
        [`RLS member category ${user.userId}`]
      );

      expect(insertResult.rows).toHaveLength(1);

      await db.query('delete from coins.categories where id = $1', [insertResult.rows[0].id]);
    });
  });
});
