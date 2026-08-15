import { describe, expect, it } from 'vitest';
import {
  parseWishlistFormData,
  validateWishlistInput
} from '@/features/coins/wishlist/server/helpers';

describe('wishlist form helpers', () => {
  it('parses form data and keeps optional expected price nullable', () => {
    const formData = new FormData();
    formData.set('name', '  Maple Leaf  ');
    formData.set('url', ' https://example.com/coin ');
    formData.set('expectedPrice', '');

    expect(parseWishlistFormData(formData)).toEqual({
      name: 'Maple Leaf',
      url: 'https://example.com/coin',
      expectedPrice: null
    });
  });

  it('validates required fields, url shape and non-negative expected price', () => {
    expect(
      validateWishlistInput({
        name: '',
        url: 'ftp://example.com',
        expectedPrice: -5
      }).fieldErrors
    ).toEqual({
      name: 'Назва монети обов’язкова.',
      url: 'Посилання має починатися з http:// або https://.',
      expectedPrice: 'Орієнтовна ціна не може бути від’ємною.'
    });
  });
});
