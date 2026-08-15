export type DashboardRecentCoin = {
  id: string;
  name: string;
  categoryName: string | null;
  acquiredAt: string;
  purchaseAmount: number;
  purchaseCurrency: string;
  mintYear: number | null;
  isPrecious: boolean;
};

export type DashboardInvestmentTotal = {
  currency: string;
  amount: number;
};

export type DashboardCategoryBreakdownItem = {
  id: string;
  name: string;
  count: number;
  totalUsd: number;
};

export type DashboardPreciousBreakdownItem = {
  key: 'precious' | 'ordinary';
  label: string;
  count: number;
  totalUsd: number;
};

export type DashboardTimelinePoint = {
  date: string;
  totalUsd: number;
  cumulativeUsd: number;
};

export type DashboardYearSpendPoint = {
  year: string;
  totalUsd: number;
  count: number;
};

export type DashboardMintYearPoint = {
  year: string;
  count: number;
};

export type CoinsDashboardSnapshot = {
  totalCoins: number;
  totalInvestmentUsd: number;
  investmentTotals: DashboardInvestmentTotal[];
  categoryBreakdown: DashboardCategoryBreakdownItem[];
  preciousBreakdown: DashboardPreciousBreakdownItem[];
  recentCoins: DashboardRecentCoin[];
  cumulativeInvestmentTimeline: DashboardTimelinePoint[];
  acquiredYearSpend: DashboardYearSpendPoint[];
  mintYearHistogram: DashboardMintYearPoint[];
};
