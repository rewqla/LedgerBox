import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/shared/supabase/server';
import { escapeForIlike } from '@/features/coins/collection/server/filters';
import type {
  CollectionCoinDetail,
  CollectionCoinListItem,
  CollectionFilterOptions,
  CollectionFilters,
  PreciousFilter
} from '@/features/coins/collection/server/types';

type CategoryRow = {
  id: string;
  name: string;
};

type CoinRow = {
  id: string;
  name: string;
  mint_year: number | null;
  acquired_at: string;
  purchase_amount: number;
  purchase_currency: string;
  fx_usd_rate?: number;
  is_precious: boolean;
  precious_metal_type: 'gold' | 'silver' | 'platinum' | null;
  precious_metal_weight_g?: number | null;
  obverse_photo_path: string | null;
  reverse_photo_path: string | null;
  notes?: string | null;
  categories: CategoryRow | CategoryRow[] | null;
};

function normalizeCategory(
  value: CategoryRow | CategoryRow[] | null
): CategoryRow | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapCoinRow(row: CoinRow): CollectionCoinListItem {
  const category = normalizeCategory(row.categories);

  return {
    id: row.id,
    name: row.name,
    mintYear: row.mint_year,
    acquiredAt: row.acquired_at,
    purchaseAmount: row.purchase_amount,
    purchaseCurrency: row.purchase_currency,
    isPrecious: row.is_precious,
    preciousMetalType: row.precious_metal_type,
    obversePhotoPath: row.obverse_photo_path,
    reversePhotoPath: row.reverse_photo_path,
    category: category
      ? {
          id: category.id,
          name: category.name
        }
      : null
  };
}

function applyPreciousFilter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  precious: PreciousFilter
) {
  if (precious === 'all') {
    return query;
  }

  if (precious === 'precious') {
    return query.eq('is_precious', true);
  }

  if (precious === 'ordinary') {
    return query.eq('is_precious', false);
  }

  return query.eq('precious_metal_type', precious);
}

export async function listCollectionCoins(
  filters: CollectionFilters
): Promise<CollectionCoinListItem[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .schema('coins')
    .from('coins')
    .select(
      'id, name, mint_year, acquired_at, purchase_amount, purchase_currency, is_precious, precious_metal_type, obverse_photo_path, reverse_photo_path, categories(id, name)'
    )
    .order('acquired_at', { ascending: false })
    .order('name', { ascending: true });

  if (filters.search) {
    query = query.ilike('name', `%${escapeForIlike(filters.search)}%`);
  }

  if (filters.year !== 'all') {
    query = query.eq('mint_year', Number(filters.year));
  }

  if (filters.categoryId !== 'all') {
    query = query.eq('category_id', filters.categoryId);
  }

  query = applyPreciousFilter(query, filters.precious);

  const { data, error } = await query.returns<CoinRow[]>();

  if (error) {
    throw new Error(`Failed to list collection coins: ${error.message}`);
  }

  return (data ?? []).map(mapCoinRow);
}

export async function getCollectionFilterOptions(): Promise<CollectionFilterOptions> {
  const supabase = await createServerSupabaseClient();
  const [{ data: categories, error: categoriesError }, { data: yearsRows, error: yearsError }] =
    await Promise.all([
      supabase
        .schema('coins')
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true })
        .returns<CategoryRow[]>(),
      supabase
        .schema('coins')
        .from('coins')
        .select('mint_year')
        .not('mint_year', 'is', null)
        .order('mint_year', { ascending: false })
    ]);

  if (categoriesError) {
    throw new Error(`Failed to load category filters: ${categoriesError.message}`);
  }

  if (yearsError) {
    throw new Error(`Failed to load year filters: ${yearsError.message}`);
  }

  const years = Array.from(
    new Set((yearsRows ?? []).map((row) => String(row.mint_year)).filter(Boolean))
  );

  return {
    categories: categories ?? [],
    years
  };
}

export async function getCollectionCoinDetail(
  coinId: string
): Promise<CollectionCoinDetail> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .schema('coins')
    .from('coins')
    .select(
      'id, name, mint_year, acquired_at, purchase_amount, purchase_currency, fx_usd_rate, is_precious, precious_metal_type, precious_metal_weight_g, obverse_photo_path, reverse_photo_path, notes, categories(id, name)'
    )
    .eq('id', coinId)
    .maybeSingle<CoinRow>();

  if (error) {
    throw new Error(`Failed to load coin detail: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  const mapped = mapCoinRow(data);

  return {
    ...mapped,
    fxUsdRate: data.fx_usd_rate ?? 0,
    notes: data.notes ?? null,
    preciousMetalWeightG: data.precious_metal_weight_g ?? null
  };
}
