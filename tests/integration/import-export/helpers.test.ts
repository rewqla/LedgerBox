import { describe, expect, it } from 'vitest';
import {
  buildCoinTransferSignature,
  buildImportSummary,
  buildCoinsExportPayload,
  parseImportPayload,
  validateImportCoinRecord
} from '@/features/coins/import-export/server/helpers';

describe('import/export helpers', () => {
  it('builds and parses the MVP JSON payload contract', () => {
    const payload = buildCoinsExportPayload([
      {
        name: 'Архангел Михаїл',
        mintYear: 2021,
        acquiredAt: '2024-02-01',
        purchaseAmount: 2500,
        purchaseCurrency: 'UAH',
        fxUsdRate: 0.024,
        categoryName: 'українська',
        isPrecious: true,
        preciousMetalType: 'silver',
        preciousMetalWeightG: 31.1,
        notes: 'test'
      }
    ]);

    const parsed = parseImportPayload(JSON.stringify(payload));

    expect(parsed.error).toBeNull();
    expect(parsed.payload?.format).toBe('ledgerbox.coins.export');
    expect(parsed.payload?.photoPolicy).toBe('excluded');
    expect(parsed.payload?.duplicatePolicy).toBe('skip-on-import');
    expect(parsed.payload?.coins).toHaveLength(1);
  });

  it('validates import records and explicitly rejects photo fields', () => {
    expect(
      validateImportCoinRecord({
        name: 'Coin',
        acquiredAt: '2024-02-01',
        purchaseAmount: 10,
        purchaseCurrency: 'USD',
        fxUsdRate: 1,
        categoryName: 'українська',
        isPrecious: false,
        obversePhotoPath: '123/obverse.webp'
      })
    ).toEqual({
      value: null,
      error: 'Фото та photo paths не підтримуються в import/export MVP.'
    });
  });

  it('builds stable duplicate signatures and import summaries', () => {
    const signatureA = buildCoinTransferSignature({
      name: '  Coin A ',
      mintYear: 2024,
      acquiredAt: '2024-02-01',
      purchaseAmount: 100,
      purchaseCurrency: 'USD',
      fxUsdRate: 1,
      categoryName: ' Срібло ',
      isPrecious: false,
      preciousMetalType: null,
      preciousMetalWeightG: null,
      notes: ' note '
    });
    const signatureB = buildCoinTransferSignature({
      name: 'coin a',
      mintYear: 2024,
      acquiredAt: '2024-02-01',
      purchaseAmount: 100,
      purchaseCurrency: 'USD',
      fxUsdRate: 1,
      categoryName: 'срібло',
      isPrecious: false,
      preciousMetalType: null,
      preciousMetalWeightG: null,
      notes: 'note'
    });

    expect(signatureA).toBe(signatureB);
    expect(
      buildImportSummary([
        { rowNumber: 1, name: 'A', status: 'imported', message: 'ok' },
        { rowNumber: 2, name: 'B', status: 'skipped', message: 'dup' },
        { rowNumber: 3, name: 'C', status: 'error', message: 'bad' }
      ])
    ).toEqual({
      total: 3,
      imported: 1,
      skipped: 1,
      errors: 1
    });
  });
});
