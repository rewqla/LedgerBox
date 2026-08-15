import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
// @ts-expect-error JS helper without declaration file is intentional for integration tests.
import { createTestDb } from '../../helpers/postgres.js';
import { createServiceRoleSupabaseClient } from '../../helpers/supabase';

const revalidatePath = vi.fn();
const resolveAuthAccessState = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath
}));

vi.mock('@/shared/auth/access', () => ({
  resolveAuthAccessState
}));

vi.mock('@/shared/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => createServiceRoleSupabaseClient())
}));

describe('import action and export route', () => {
  const db = createTestDb();
  let categoryId: string | null = null;
  let exportedCoinId: string | null = null;

  beforeAll(async () => {
    await db.connect();

    const categoryResult = await db.query(
      `
        insert into coins.categories (name)
        values ($1)
        returning id
      `,
      [`Export category ${randomUUID()}`]
    );
    categoryId = categoryResult.rows[0].id;

    const coinResult = await db.query(
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
        returning id
      `,
      [
        `Exported coin ${randomUUID()}`,
        2024,
        '2026-08-15',
        150,
        'USD',
        1,
        categoryId,
        false,
        'coin used in export route test'
      ]
    );
    exportedCoinId = coinResult.rows[0].id;
  });

  afterAll(async () => {
    if (exportedCoinId) {
      await db.query('delete from coins.coins where id = $1', [exportedCoinId]);
    }

    if (categoryId) {
      await db.query('delete from coins.categories where id = $1', [categoryId]);
    }

    await db.query(
      `
        delete from coins.coins
        where name like 'Imported action coin %'
           or name = 'Bad photo path coin'
      `
    );

    await db.query(
      `
        delete from coins.categories
        where name like 'Imported action category%'
      `
    );

    await db.end();
  });

  it('imports valid records, skips duplicates and reports invalid rows through the server action', async () => {
    const { importCoinsAction } = await import('@/features/coins/import-export/server/actions');
    const { INITIAL_IMPORT_COINS_FORM_STATE } = await import(
      '@/features/coins/import-export/server/form-state'
    );

    const uniqueName = `Imported action coin ${randomUUID()}`;
    const duplicateCategoryName = `Imported action category ${randomUUID()}`;
    const payload = {
      format: 'ledgerbox.coins.export',
      version: 1,
      exportedAt: '2026-08-15T09:30:00.000Z',
      photoPolicy: 'excluded',
      duplicatePolicy: 'skip-on-import',
      coins: [
        {
          name: uniqueName,
          mintYear: 2023,
          acquiredAt: '2026-08-14',
          purchaseAmount: 2500,
          purchaseCurrency: 'UAH',
          fxUsdRate: 0.024,
          categoryName: duplicateCategoryName,
          isPrecious: false,
          preciousMetalType: null,
          preciousMetalWeightG: null,
          notes: 'imported by action test'
        },
        {
          name: uniqueName,
          mintYear: 2023,
          acquiredAt: '2026-08-14',
          purchaseAmount: 2500,
          purchaseCurrency: 'UAH',
          fxUsdRate: 0.024,
          categoryName: duplicateCategoryName,
          isPrecious: false,
          preciousMetalType: null,
          preciousMetalWeightG: null,
          notes: 'imported by action test'
        },
        {
          name: 'Bad photo path coin',
          mintYear: 2023,
          acquiredAt: '2026-08-14',
          purchaseAmount: 100,
          purchaseCurrency: 'USD',
          fxUsdRate: 1,
          categoryName: 'Imported action category invalid',
          isPrecious: false,
          preciousMetalType: null,
          preciousMetalWeightG: null,
          notes: null,
          obversePhotoPath: 'not-allowed.webp'
        }
      ]
    };

    const formData = new FormData();
    formData.set(
      'file',
      new File([JSON.stringify(payload)], 'import.json', {
        type: 'application/json'
      })
    );

    const result = await importCoinsAction(INITIAL_IMPORT_COINS_FORM_STATE, formData);

    expect(result.summary).toEqual({
      total: 3,
      imported: 1,
      skipped: 1,
      errors: 1
    });
    expect(result.report.map((item) => item.status)).toEqual([
      'imported',
      'skipped',
      'error'
    ]);

    const importedCoinResult = await db.query(
      `
        select name
        from coins.coins
        where name = $1
      `,
      [uniqueName]
    );

    expect(importedCoinResult.rows).toHaveLength(1);
    expect(revalidatePath).toHaveBeenCalledWith('/coins/collection');
    expect(revalidatePath).toHaveBeenCalledWith('/coins/collection/import-export');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('exports the collection for members and rejects non-members in the route handler', async () => {
    const { GET } = await import('@/app/api/coins/collection/export/route');

    resolveAuthAccessState.mockResolvedValueOnce({
      kind: 'anonymous'
    });

    const forbiddenResponse = await GET();
    expect(forbiddenResponse.status).toBe(403);
    expect(await forbiddenResponse.json()).toEqual({
      error: 'Member access is required.'
    });

    resolveAuthAccessState.mockResolvedValueOnce({
      kind: 'member',
      userId: 'member-id',
      email: 'member@example.com',
      fullName: 'Member'
    });

    const successResponse = await GET();
    expect(successResponse.status).toBe(200);
    expect(successResponse.headers.get('content-disposition')).toContain(
      'ledgerbox-coins-export.json'
    );

    const body = JSON.parse(await successResponse.text());
    expect(body.format).toBe('ledgerbox.coins.export');
    expect(body.photoPolicy).toBe('excluded');
    expect(body.coins.length).toBeGreaterThan(0);
    expect(body.coins.some((coin: Record<string, unknown>) => coin.id !== undefined)).toBe(false);
    expect(
      body.coins.some((coin: Record<string, unknown>) => 'obversePhotoPath' in coin)
    ).toBe(false);
  });
});
