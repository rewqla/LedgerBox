import { createServerSupabaseClient } from '@/shared/supabase/server';
import type {
  CoinsDashboardSnapshot,
  DashboardCategoryBreakdownItem,
  DashboardInvestmentTotal,
  DashboardMintYearPoint,
  DashboardPreciousBreakdownItem,
  DashboardRecentCoin,
  DashboardTimelinePoint,
  DashboardYearSpendPoint
} from '@/features/coins/dashboard/server/types';

type CategoryRow = {
  id: string;
  name: string;
};

type DashboardCoinRow = {
  id: string;
  name: string;
  acquired_at: string;
  purchase_amount: number;
  purchase_currency: string;
  fx_usd_rate: number;
  mint_year: number | null;
  is_precious: boolean;
  created_at: string;
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

export function calculateUsdAmount(row: Pick<DashboardCoinRow, 'purchase_amount' | 'fx_usd_rate'>) {
  return Number((row.purchase_amount * row.fx_usd_rate).toFixed(2));
}

export function buildCoinsDashboardSnapshot(
  rows: DashboardCoinRow[]
): CoinsDashboardSnapshot {
  const sortedByCreated = [...rows].sort((left, right) =>
    right.created_at.localeCompare(left.created_at)
  );
  const sortedByAcquired = [...rows].sort((left, right) =>
    left.acquired_at.localeCompare(right.acquired_at)
  );

  const investmentTotalsMap = new Map<string, number>();
  const categoryBreakdownMap = new Map<string, DashboardCategoryBreakdownItem>();
  const preciousBreakdownMap = new Map<'precious' | 'ordinary', DashboardPreciousBreakdownItem>();
  const acquiredTimelineMap = new Map<string, number>();
  const acquiredYearSpendMap = new Map<string, DashboardYearSpendPoint>();
  const mintYearMap = new Map<string, DashboardMintYearPoint>();

  let totalInvestmentUsd = 0;

  rows.forEach((row) => {
    const usdAmount = calculateUsdAmount(row);
    const category = normalizeCategory(row.categories);
    const investmentAmount = investmentTotalsMap.get(row.purchase_currency) ?? 0;

    investmentTotalsMap.set(
      row.purchase_currency,
      Number((investmentAmount + row.purchase_amount).toFixed(2))
    );

    totalInvestmentUsd = Number((totalInvestmentUsd + usdAmount).toFixed(2));

    const categoryKey = category?.id ?? 'uncategorized';
    const categoryName = category?.name ?? 'Без категорії';
    const categoryItem = categoryBreakdownMap.get(categoryKey);

    categoryBreakdownMap.set(categoryKey, {
      id: categoryKey,
      name: categoryName,
      count: (categoryItem?.count ?? 0) + 1,
      totalUsd: Number(((categoryItem?.totalUsd ?? 0) + usdAmount).toFixed(2))
    });

    const preciousKey = row.is_precious ? 'precious' : 'ordinary';
    const preciousLabel = row.is_precious ? 'Дорогоцінні' : 'Звичайні';
    const preciousItem = preciousBreakdownMap.get(preciousKey);

    preciousBreakdownMap.set(preciousKey, {
      key: preciousKey,
      label: preciousLabel,
      count: (preciousItem?.count ?? 0) + 1,
      totalUsd: Number(((preciousItem?.totalUsd ?? 0) + usdAmount).toFixed(2))
    });

    acquiredTimelineMap.set(
      row.acquired_at,
      Number(((acquiredTimelineMap.get(row.acquired_at) ?? 0) + usdAmount).toFixed(2))
    );

    const acquiredYear = row.acquired_at.slice(0, 4);
    const acquiredYearItem = acquiredYearSpendMap.get(acquiredYear);
    acquiredYearSpendMap.set(acquiredYear, {
      year: acquiredYear,
      totalUsd: Number(((acquiredYearItem?.totalUsd ?? 0) + usdAmount).toFixed(2)),
      count: (acquiredYearItem?.count ?? 0) + 1
    });

    if (row.mint_year !== null) {
      const mintYear = String(row.mint_year);
      const mintYearItem = mintYearMap.get(mintYear);
      mintYearMap.set(mintYear, {
        year: mintYear,
        count: (mintYearItem?.count ?? 0) + 1
      });
    }
  });

  const investmentTotals: DashboardInvestmentTotal[] = Array.from(
    investmentTotalsMap.entries()
  )
    .map(([currency, amount]) => ({
      currency,
      amount
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency));

  const categoryBreakdown = Array.from(categoryBreakdownMap.values()).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.name.localeCompare(right.name);
  });

  const preciousBreakdown: DashboardPreciousBreakdownItem[] = [
    preciousBreakdownMap.get('precious') ?? {
      key: 'precious',
      label: 'Дорогоцінні',
      count: 0,
      totalUsd: 0
    },
    preciousBreakdownMap.get('ordinary') ?? {
      key: 'ordinary',
      label: 'Звичайні',
      count: 0,
      totalUsd: 0
    }
  ];

  let cumulativeUsd = 0;
  const cumulativeInvestmentTimeline: DashboardTimelinePoint[] = Array.from(
    acquiredTimelineMap.entries()
  )
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([date, totalUsd]) => {
      cumulativeUsd = Number((cumulativeUsd + totalUsd).toFixed(2));

      return {
        date,
        totalUsd,
        cumulativeUsd
      };
    });

  const acquiredYearSpend: DashboardYearSpendPoint[] = Array.from(
    acquiredYearSpendMap.values()
  ).sort((left, right) => left.year.localeCompare(right.year));

  const mintYearHistogram: DashboardMintYearPoint[] = Array.from(mintYearMap.values()).sort(
    (left, right) => left.year.localeCompare(right.year)
  );

  const recentCoins: DashboardRecentCoin[] = sortedByCreated.slice(0, 8).map((row) => {
    const category = normalizeCategory(row.categories);

    return {
      id: row.id,
      name: row.name,
      categoryName: category?.name ?? null,
      acquiredAt: row.acquired_at,
      purchaseAmount: row.purchase_amount,
      purchaseCurrency: row.purchase_currency,
      mintYear: row.mint_year,
      isPrecious: row.is_precious
    };
  });

  return {
    totalCoins: rows.length,
    totalInvestmentUsd,
    investmentTotals,
    categoryBreakdown,
    preciousBreakdown,
    recentCoins,
    cumulativeInvestmentTimeline,
    acquiredYearSpend,
    mintYearHistogram
  };
}

export async function getCoinsDashboardSnapshot(): Promise<CoinsDashboardSnapshot> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .schema('coins')
    .from('coins')
    .select(
      'id, name, acquired_at, purchase_amount, purchase_currency, fx_usd_rate, mint_year, is_precious, created_at, categories(id, name)'
    )
    .order('created_at', { ascending: false })
    .returns<DashboardCoinRow[]>();

  if (error) {
    throw new Error(`Failed to load dashboard snapshot: ${error.message}`);
  }

  return buildCoinsDashboardSnapshot(data ?? []);
}
