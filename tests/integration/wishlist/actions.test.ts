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

describe('wishlist server actions', () => {
  const db = createTestDb();

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.end();
  });

  it('creates, updates and marks wishlist items as purchased through server actions', async () => {
    const {
      createWishlistItemAction,
      updateWishlistItemAction,
      markWishlistItemPurchasedAction
    } = await import('@/features/coins/wishlist/server/actions');
    const { INITIAL_WISHLIST_FORM_STATE } = await import(
      '@/features/coins/wishlist/server/form-state'
    );

    const createData = new FormData();
    const initialName = `Wishlist ${randomUUID()}`;
    createData.set('name', initialName);
    createData.set('url', 'https://example.com/coin');
    createData.set('expectedPrice', '125');

    const createResult = await createWishlistItemAction(
      INITIAL_WISHLIST_FORM_STATE,
      createData
    );

    expect(createResult).toEqual({
      success: true,
      message: 'Позицію додано до бажанок.',
      fieldErrors: {}
    });

    const createdWishlistResult = await db.query(
      `
        select id, name, url, expected_price
        from coins.wishlist_items
        where name = $1
      `,
      [initialName]
    );

    expect(createdWishlistResult.rows).toHaveLength(1);
    const wishlistItemId = createdWishlistResult.rows[0].id;

    const updateData = new FormData();
    updateData.set('name', `${initialName} updated`);
    updateData.set('url', 'https://example.com/coin-updated');
    updateData.set('expectedPrice', '140');

    const updateResult = await updateWishlistItemAction(
      wishlistItemId,
      INITIAL_WISHLIST_FORM_STATE,
      updateData
    );

    expect(updateResult).toEqual({
      success: true,
      message: 'Позицію оновлено.',
      fieldErrors: {}
    });

    const updatedWishlistResult = await db.query(
      `
        select name, url, expected_price
        from coins.wishlist_items
        where id = $1
      `,
      [wishlistItemId]
    );

    expect(updatedWishlistResult.rows[0].name).toBe(`${initialName} updated`);
    expect(updatedWishlistResult.rows[0].url).toBe('https://example.com/coin-updated');
    expect(Number(updatedWishlistResult.rows[0].expected_price)).toBe(140);

    await markWishlistItemPurchasedAction(wishlistItemId);

    const existsAfterPurchased = await db.query(
      `
        select id
        from coins.wishlist_items
        where id = $1
      `,
      [wishlistItemId]
    );

    expect(existsAfterPurchased.rows).toEqual([]);
    expect(revalidatePath).toHaveBeenCalledWith('/coins/wishlist');
  });
});
