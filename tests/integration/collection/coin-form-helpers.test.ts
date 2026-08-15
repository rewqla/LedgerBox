import { describe, expect, it } from 'vitest';
import {
  parseCoinFormData,
  validateCoinFormInput
} from '@/features/coins/collection/server/helpers';

function buildFormData(entries: Record<string, string | boolean>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    if (typeof value === 'boolean') {
      if (value) {
        formData.set(key, 'on');
      }
    } else {
      formData.set(key, value);
    }
  }

  return formData;
}

describe('coin form helpers', () => {
  it('parses form data into normalized values', () => {
    const formData = buildFormData({
      name: '  Срібна гривня ',
      mintYear: '2021',
      acquiredAt: '2026-08-14',
      purchaseAmount: '1200.50',
      purchaseCurrency: 'UAH',
      fxUsdRate: '41.2',
      categoryId: 'category-1',
      isPrecious: true,
      preciousMetalType: 'silver',
      preciousMetalWeightG: '31.1',
      notes: ' test ',
      obversePhotoUrl: 'https://example.com/obverse.jpg',
      removeReversePhoto: true
    });

    const parsed = parseCoinFormData(formData);

    expect(parsed.values).toMatchObject({
      name: 'Срібна гривня',
      mintYear: 2021,
      acquiredAt: '2026-08-14',
      purchaseAmount: 1200.5,
      purchaseCurrency: 'UAH',
      fxUsdRate: 41.2,
      categoryId: 'category-1',
      isPrecious: true,
      preciousMetalType: 'silver',
      preciousMetalWeightG: 31.1,
      notes: 'test',
      obversePhotoUrl: 'https://example.com/obverse.jpg',
      reversePhotoUrl: '',
      removeObversePhoto: false,
      removeReversePhoto: true
    });
  });

  it('flags invalid core fields and photo source conflicts', () => {
    const file = new File(['hello'], 'coin.webp', { type: 'image/webp' });

    const validation = validateCoinFormInput(
      {
        name: '',
        mintYear: 999,
        acquiredAt: '',
        purchaseAmount: -1,
        purchaseCurrency: 'GBP' as 'UAH',
        fxUsdRate: 0,
        categoryId: '',
        isPrecious: true,
        preciousMetalType: null,
        preciousMetalWeightG: null,
        notes: '',
        obversePhotoUrl: 'https://example.com/obverse.jpg',
        reversePhotoUrl: '',
        removeObversePhoto: false,
        removeReversePhoto: false
      },
      {
        obversePhotoFile: file,
        reversePhotoFile: null
      }
    );

    expect(validation.fieldErrors).toMatchObject({
      name: 'Назва монети обов’язкова.',
      mintYear: 'Рік карбування має бути в межах 1000-9999.',
      acquiredAt: 'Дата придбання обов’язкова.',
      purchaseAmount: 'Сума придбання має бути додатною або нульовою.',
      purchaseCurrency: 'Підтримуються тільки UAH, USD або EUR.',
      fxUsdRate: 'Курс USD має бути більшим за нуль.',
      categoryId: 'Оберіть категорію.',
      preciousMetalType: 'Для дорогоцінної монети оберіть тип металу.',
      preciousMetalWeightG: 'Для дорогоцінної монети вкажіть вагу дорогоцінного металу.',
      obversePhotoFile: 'Оберіть або локальний файл, або URL-імпорт для цього слоту.'
    });
  });
});
