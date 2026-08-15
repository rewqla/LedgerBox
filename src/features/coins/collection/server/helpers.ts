import type { CoinFormState } from '@/features/coins/collection/server/form-state';
import type { CollectionCoinDetail } from '@/features/coins/collection/server/types';

export type CoinFormValues = {
  name: string;
  mintYear: number | null;
  acquiredAt: string;
  purchaseAmount: number;
  purchaseCurrency: 'UAH' | 'USD' | 'EUR';
  fxUsdRate: number;
  categoryId: string;
  isPrecious: boolean;
  preciousMetalType: 'gold' | 'silver' | 'platinum' | null;
  preciousMetalWeightG: number | null;
  notes: string;
  obversePhotoUrl: string;
  reversePhotoUrl: string;
  removeObversePhoto: boolean;
  removeReversePhoto: boolean;
};

export type CoinFormFiles = {
  obversePhotoFile: File | null;
  reversePhotoFile: File | null;
};

export function asInputDate(value: string): string {
  return value.slice(0, 10);
}

function getString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function getNullableNumber(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function getBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on';
}

function getFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);

  if (!value || typeof value === 'string') {
    return null;
  }

  return value.size > 0 ? value : null;
}

export function getInitialCoinFormValues(
  coin: CollectionCoinDetail | null
): CoinFormValues {
  return {
    name: coin?.name ?? '',
    mintYear: coin?.mintYear ?? null,
    acquiredAt: coin ? asInputDate(coin.acquiredAt) : new Date().toISOString().slice(0, 10),
    purchaseAmount: coin?.purchaseAmount ?? 0,
    purchaseCurrency:
      (coin?.purchaseCurrency as CoinFormValues['purchaseCurrency']) ?? 'UAH',
    fxUsdRate: coin?.fxUsdRate ?? 1,
    categoryId: coin?.category?.id ?? '',
    isPrecious: coin?.isPrecious ?? false,
    preciousMetalType: coin?.preciousMetalType ?? null,
    preciousMetalWeightG: coin?.preciousMetalWeightG ?? null,
    notes: coin?.notes ?? '',
    obversePhotoUrl: '',
    reversePhotoUrl: '',
    removeObversePhoto: false,
    removeReversePhoto: false
  };
}

export function parseCoinFormData(formData: FormData): {
  values: CoinFormValues;
  files: CoinFormFiles;
} {
  const isPrecious = getBoolean(formData, 'isPrecious');
  const mintYear = getNullableNumber(getString(formData, 'mintYear'));
  const preciousMetalType = getString(formData, 'preciousMetalType');

  return {
    values: {
      name: getString(formData, 'name'),
      mintYear,
      acquiredAt: getString(formData, 'acquiredAt'),
      purchaseAmount: Number(getString(formData, 'purchaseAmount') || 0),
      purchaseCurrency: (getString(formData, 'purchaseCurrency') || 'UAH') as CoinFormValues['purchaseCurrency'],
      fxUsdRate: Number(getString(formData, 'fxUsdRate') || 0),
      categoryId: getString(formData, 'categoryId'),
      isPrecious,
      preciousMetalType: isPrecious && preciousMetalType ? (preciousMetalType as CoinFormValues['preciousMetalType']) : null,
      preciousMetalWeightG: isPrecious
        ? getNullableNumber(getString(formData, 'preciousMetalWeightG'))
        : null,
      notes: getString(formData, 'notes'),
      obversePhotoUrl: getString(formData, 'obversePhotoUrl'),
      reversePhotoUrl: getString(formData, 'reversePhotoUrl'),
      removeObversePhoto: getBoolean(formData, 'removeObversePhoto'),
      removeReversePhoto: getBoolean(formData, 'removeReversePhoto')
    },
    files: {
      obversePhotoFile: getFile(formData, 'obversePhotoFile'),
      reversePhotoFile: getFile(formData, 'reversePhotoFile')
    }
  };
}

function validatePhotoSourceConflict(
  file: File | null,
  url: string,
  remove: boolean,
  slot: 'obverse' | 'reverse',
  fieldErrors: Record<string, string>
) {
  if (file && url) {
    fieldErrors[`${slot}PhotoFile`] = 'Оберіть або локальний файл, або URL-імпорт для цього слоту.';
  }

  if (remove && (file || url)) {
    fieldErrors[`remove${slot === 'obverse' ? 'Obverse' : 'Reverse'}Photo`] =
      'Не можна одночасно видаляти фото і завантажувати нове в той самий слот.';
  }
}

export function validateCoinFormInput(
  values: CoinFormValues,
  files: CoinFormFiles
): CoinFormState {
  const fieldErrors: Record<string, string> = {};

  if (!values.name) {
    fieldErrors.name = 'Назва монети обов’язкова.';
  }

  if (!values.acquiredAt) {
    fieldErrors.acquiredAt = 'Дата придбання обов’язкова.';
  }

  if (!values.categoryId) {
    fieldErrors.categoryId = 'Оберіть категорію.';
  }

  if (!['UAH', 'USD', 'EUR'].includes(values.purchaseCurrency)) {
    fieldErrors.purchaseCurrency = 'Підтримуються тільки UAH, USD або EUR.';
  }

  if (!Number.isFinite(values.purchaseAmount) || values.purchaseAmount < 0) {
    fieldErrors.purchaseAmount = 'Сума придбання має бути додатною або нульовою.';
  }

  if (!Number.isFinite(values.fxUsdRate) || values.fxUsdRate <= 0) {
    fieldErrors.fxUsdRate = 'Курс USD має бути більшим за нуль.';
  }

  if (values.mintYear !== null && (values.mintYear < 1000 || values.mintYear > 9999)) {
    fieldErrors.mintYear = 'Рік карбування має бути в межах 1000-9999.';
  }

  if (values.isPrecious) {
    if (!values.preciousMetalType) {
      fieldErrors.preciousMetalType = 'Для дорогоцінної монети оберіть тип металу.';
    }

    if (
      values.preciousMetalWeightG === null ||
      !Number.isFinite(values.preciousMetalWeightG) ||
      values.preciousMetalWeightG <= 0
    ) {
      fieldErrors.preciousMetalWeightG =
        'Для дорогоцінної монети вкажіть вагу дорогоцінного металу.';
    }
  }

  validatePhotoSourceConflict(
    files.obversePhotoFile,
    values.obversePhotoUrl,
    values.removeObversePhoto,
    'obverse',
    fieldErrors
  );
  validatePhotoSourceConflict(
    files.reversePhotoFile,
    values.reversePhotoUrl,
    values.removeReversePhoto,
    'reverse',
    fieldErrors
  );

  return {
    success: false,
    message: null,
    fieldErrors
  };
}
