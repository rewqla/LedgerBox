import { describe, expect, it } from 'vitest';
import {
  buildCoinsDashboardSnapshot,
  calculateUsdAmount
} from '@/features/coins/dashboard/server/queries';

describe('coins dashboard snapshot', () => {
  it('calculates USD amounts from the stored fx rate', () => {
    expect(
      calculateUsdAmount({
        purchase_amount: 2500,
        fx_usd_rate: 0.024
      })
    ).toBe(60);
  });

  it('builds summary cards, breakdowns and charts from collection rows', () => {
    const snapshot = buildCoinsDashboardSnapshot([
      {
        id: 'coin-1',
        name: 'Архангел Михаїл',
        acquired_at: '2024-01-12',
        purchase_amount: 2500,
        purchase_currency: 'UAH',
        fx_usd_rate: 0.024,
        mint_year: 2021,
        is_precious: true,
        created_at: '2024-01-13T10:00:00.000Z',
        categories: {
          id: 'cat-1',
          name: 'українська'
        }
      },
      {
        id: 'coin-2',
        name: 'Maple Leaf',
        acquired_at: '2024-06-08',
        purchase_amount: 80,
        purchase_currency: 'USD',
        fx_usd_rate: 1,
        mint_year: 2023,
        is_precious: true,
        created_at: '2024-06-09T10:00:00.000Z',
        categories: {
          id: 'cat-2',
          name: 'закордонна'
        }
      },
      {
        id: 'coin-3',
        name: 'Commemorative Euro',
        acquired_at: '2025-02-01',
        purchase_amount: 50,
        purchase_currency: 'EUR',
        fx_usd_rate: 1.08,
        mint_year: 2020,
        is_precious: false,
        created_at: '2025-02-03T10:00:00.000Z',
        categories: {
          id: 'cat-2',
          name: 'закордонна'
        }
      }
    ]);

    expect(snapshot.totalCoins).toBe(3);
    expect(snapshot.totalInvestmentUsd).toBe(194);
    expect(snapshot.investmentTotals).toEqual([
      { currency: 'EUR', amount: 50 },
      { currency: 'UAH', amount: 2500 },
      { currency: 'USD', amount: 80 }
    ]);
    expect(snapshot.categoryBreakdown).toEqual([
      {
        id: 'cat-2',
        name: 'закордонна',
        count: 2,
        totalUsd: 134
      },
      {
        id: 'cat-1',
        name: 'українська',
        count: 1,
        totalUsd: 60
      }
    ]);
    expect(snapshot.preciousBreakdown).toEqual([
      {
        key: 'precious',
        label: 'Дорогоцінні',
        count: 2,
        totalUsd: 140
      },
      {
        key: 'ordinary',
        label: 'Звичайні',
        count: 1,
        totalUsd: 54
      }
    ]);
    expect(snapshot.recentCoins.map((coin) => coin.id)).toEqual([
      'coin-3',
      'coin-2',
      'coin-1'
    ]);
    expect(snapshot.cumulativeInvestmentTimeline).toEqual([
      {
        date: '2024-01-12',
        totalUsd: 60,
        cumulativeUsd: 60
      },
      {
        date: '2024-06-08',
        totalUsd: 80,
        cumulativeUsd: 140
      },
      {
        date: '2025-02-01',
        totalUsd: 54,
        cumulativeUsd: 194
      }
    ]);
    expect(snapshot.acquiredYearSpend).toEqual([
      {
        year: '2024',
        totalUsd: 140,
        count: 2
      },
      {
        year: '2025',
        totalUsd: 54,
        count: 1
      }
    ]);
    expect(snapshot.mintYearHistogram).toEqual([
      {
        year: '2020',
        count: 1
      },
      {
        year: '2021',
        count: 1
      },
      {
        year: '2023',
        count: 1
      }
    ]);
  });

  it('returns zeroed breakdowns for an empty dashboard', () => {
    const snapshot = buildCoinsDashboardSnapshot([]);

    expect(snapshot.totalCoins).toBe(0);
    expect(snapshot.totalInvestmentUsd).toBe(0);
    expect(snapshot.investmentTotals).toEqual([]);
    expect(snapshot.categoryBreakdown).toEqual([]);
    expect(snapshot.preciousBreakdown).toEqual([
      {
        key: 'precious',
        label: 'Дорогоцінні',
        count: 0,
        totalUsd: 0
      },
      {
        key: 'ordinary',
        label: 'Звичайні',
        count: 0,
        totalUsd: 0
      }
    ]);
    expect(snapshot.recentCoins).toEqual([]);
    expect(snapshot.cumulativeInvestmentTimeline).toEqual([]);
    expect(snapshot.acquiredYearSpend).toEqual([]);
    expect(snapshot.mintYearHistogram).toEqual([]);
  });
});
