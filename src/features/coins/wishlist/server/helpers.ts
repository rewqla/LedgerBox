import type { WishlistFormState } from '@/features/coins/wishlist/server/form-state';

export type WishlistFormValues = {
  name: string;
  url: string;
  expectedPrice: number | null;
};

export function parseWishlistFormData(formData: FormData): WishlistFormValues {
  const expectedPriceRaw = String(formData.get('expectedPrice') ?? '').trim();

  return {
    name: String(formData.get('name') ?? '').trim(),
    url: String(formData.get('url') ?? '').trim(),
    expectedPrice: expectedPriceRaw ? Number(expectedPriceRaw) : null
  };
}

export function validateWishlistInput(
  values: WishlistFormValues
): WishlistFormState {
  const fieldErrors: Record<string, string> = {};

  if (!values.name) {
    fieldErrors.name = 'Назва монети обов’язкова.';
  }

  if (!values.url) {
    fieldErrors.url = 'Посилання на товар обов’язкове.';
  } else {
    try {
      const parsedUrl = new URL(values.url);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        fieldErrors.url = 'Посилання має починатися з http:// або https://.';
      }
    } catch {
      fieldErrors.url = 'Введіть коректне посилання на товар.';
    }
  }

  if (values.expectedPrice !== null) {
    if (Number.isNaN(values.expectedPrice)) {
      fieldErrors.expectedPrice = 'Орієнтовна ціна має бути числом.';
    } else if (values.expectedPrice < 0) {
      fieldErrors.expectedPrice = 'Орієнтовна ціна не може бути від’ємною.';
    }
  }

  return {
    success: false,
    message: null,
    fieldErrors
  };
}
