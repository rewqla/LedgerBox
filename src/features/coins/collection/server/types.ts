export const COLLECTION_VIEW_STORAGE_KEY = 'ledgerbox:coins:collection:view-mode';

export type CollectionViewMode = 'cards' | 'table';

export type PreciousFilter =
  | 'all'
  | 'precious'
  | 'ordinary'
  | 'gold'
  | 'silver'
  | 'platinum';

export type CollectionFilters = {
  search: string;
  year: string;
  categoryId: string;
  precious: PreciousFilter;
};

export type CollectionSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type CollectionCoinListItem = {
  id: string;
  name: string;
  mintYear: number | null;
  acquiredAt: string;
  purchaseAmount: number;
  purchaseCurrency: string;
  isPrecious: boolean;
  preciousMetalType: 'gold' | 'silver' | 'platinum' | null;
  obversePhotoPath: string | null;
  reversePhotoPath: string | null;
  category: {
    id: string;
    name: string;
  } | null;
};

export type CollectionCoinDetail = CollectionCoinListItem & {
  fxUsdRate: number;
  notes: string | null;
  preciousMetalWeightG: number | null;
};

export type CollectionFilterOptions = {
  categories: Array<{
    id: string;
    name: string;
  }>;
  years: string[];
};
