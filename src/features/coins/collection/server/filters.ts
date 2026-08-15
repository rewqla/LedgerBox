import type {
  CollectionFilters,
  CollectionSearchParams,
  CollectionViewMode,
  PreciousFilter
} from '@/features/coins/collection/server/types';

const PRECIOUS_FILTERS: PreciousFilter[] = [
  'all',
  'precious',
  'ordinary',
  'gold',
  'silver',
  'platinum'
];

export const DEFAULT_COLLECTION_FILTERS: CollectionFilters = {
  search: '',
  year: 'all',
  categoryId: 'all',
  precious: 'all'
};

export function getSingleSearchParam(
  value: string | string[] | undefined
): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export function normalizeCollectionFilters(
  searchParams: CollectionSearchParams
): CollectionFilters {
  const search = getSingleSearchParam(searchParams.search).trim();
  const year = getSingleSearchParam(searchParams.year).trim();
  const categoryId = getSingleSearchParam(searchParams.categoryId).trim();
  const preciousCandidate = getSingleSearchParam(searchParams.precious).trim() as PreciousFilter;

  return {
    search,
    year: year || 'all',
    categoryId: categoryId || 'all',
    precious: PRECIOUS_FILTERS.includes(preciousCandidate)
      ? preciousCandidate
      : 'all'
  };
}

export function escapeForIlike(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');
}

export function normalizeCollectionViewMode(value: string | null): CollectionViewMode {
  return value === 'table' ? 'table' : 'cards';
}

export function getPreciousFilterLabel(filter: PreciousFilter): string {
  switch (filter) {
    case 'precious':
      return 'Дорогоцінні';
    case 'ordinary':
      return 'Звичайні';
    case 'gold':
      return 'Золото';
    case 'silver':
      return 'Срібло';
    case 'platinum':
      return 'Платина';
    default:
      return 'Усі';
  }
}
