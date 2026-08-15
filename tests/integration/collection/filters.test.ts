import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COLLECTION_FILTERS,
  escapeForIlike,
  getPreciousFilterLabel,
  normalizeCollectionFilters,
  normalizeCollectionViewMode
} from '@/features/coins/collection/server/filters';

describe('collection filter normalization', () => {
  it('falls back to defaults when search params are missing or invalid', () => {
    expect(normalizeCollectionFilters({})).toEqual(DEFAULT_COLLECTION_FILTERS);
    expect(
      normalizeCollectionFilters({
        precious: 'unknown',
        categoryId: '',
        year: ''
      })
    ).toEqual(DEFAULT_COLLECTION_FILTERS);
  });

  it('keeps valid search, category, year and precious filters', () => {
    expect(
      normalizeCollectionFilters({
        search: '  Гривня  ',
        year: '2021',
        categoryId: 'category-1',
        precious: 'silver'
      })
    ).toEqual({
      search: 'Гривня',
      year: '2021',
      categoryId: 'category-1',
      precious: 'silver'
    });
  });

  it('escapes special ilike characters and normalizes the persisted view mode', () => {
    expect(escapeForIlike('100% silver_coin')).toBe('100\\% silver\\_coin');
    expect(normalizeCollectionViewMode('cards')).toBe('cards');
    expect(normalizeCollectionViewMode('table')).toBe('table');
    expect(normalizeCollectionViewMode('gallery')).toBe('cards');
    expect(normalizeCollectionViewMode(null)).toBe('cards');
  });

  it('returns human-friendly labels for precious filters', () => {
    expect(getPreciousFilterLabel('all')).toBe('Усі');
    expect(getPreciousFilterLabel('precious')).toBe('Дорогоцінні');
    expect(getPreciousFilterLabel('ordinary')).toBe('Звичайні');
    expect(getPreciousFilterLabel('gold')).toBe('Золото');
    expect(getPreciousFilterLabel('silver')).toBe('Срібло');
    expect(getPreciousFilterLabel('platinum')).toBe('Платина');
  });
});
