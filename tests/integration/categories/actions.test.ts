import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
// @ts-expect-error JS helper without declaration file is intentional for integration tests.
import { createTestDb } from '../../helpers/postgres.js';
import { createServiceRoleSupabaseClient } from '../../helpers/supabase';

const revalidatePath = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath
}));

vi.mock('@/shared/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => createServiceRoleSupabaseClient())
}));

describe('category server actions', () => {
  const db = createTestDb();

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.end();
  });

  it('creates and renames categories through server actions while revalidating routes', async () => {
    const { createCategoryAction, renameCategoryAction, INITIAL_CATEGORY_FORM_STATE } =
      await import('@/features/coins/categories/server/actions');

    const categoryName = `Action category ${randomUUID()}`;
    const createData = new FormData();
    createData.set('name', categoryName);

    const createResult = await createCategoryAction(INITIAL_CATEGORY_FORM_STATE, createData);

    expect(createResult).toEqual({
      success: true,
      message: 'Категорію створено.',
      fieldErrors: {}
    });

    const createdCategoryResult = await db.query(
      `
        select id, name
        from coins.categories
        where name = $1
      `,
      [categoryName]
    );

    expect(createdCategoryResult.rows).toHaveLength(1);

    const categoryId = createdCategoryResult.rows[0].id;
    const renamed = `${categoryName} renamed`;
    const renameData = new FormData();
    renameData.set('name', renamed);

    const renameResult = await renameCategoryAction(
      categoryId,
      INITIAL_CATEGORY_FORM_STATE,
      renameData
    );

    expect(renameResult).toEqual({
      success: true,
      message: 'Категорію оновлено.',
      fieldErrors: {}
    });

    const updatedCategoryResult = await db.query(
      `
        select name
        from coins.categories
        where id = $1
      `,
      [categoryId]
    );

    expect(updatedCategoryResult.rows[0].name).toBe(renamed);
    expect(revalidatePath).toHaveBeenCalledWith('/coins/collection');
    expect(revalidatePath).toHaveBeenCalledWith('/coins/collection/categories');

    await db.query('delete from coins.categories where id = $1', [categoryId]);
  });
});
