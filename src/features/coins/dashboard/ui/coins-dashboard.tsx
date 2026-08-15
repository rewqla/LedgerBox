import Link from 'next/link';
import type {
  CoinsDashboardSnapshot,
  DashboardCategoryBreakdownItem,
  DashboardMintYearPoint,
  DashboardPreciousBreakdownItem,
  DashboardTimelinePoint,
  DashboardYearSpendPoint
} from '@/features/coins/dashboard/server/types';

type CoinsDashboardProps = {
  snapshot: CoinsDashboardSnapshot;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatCompactUsd(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'USD',
    notation: amount >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 2
  }).format(amount);
}

function shellCardStyle(columns = '1fr') {
  return {
    display: 'grid',
    gap: '1rem',
    padding: '1.4rem',
    borderRadius: '1.4rem',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    boxShadow: 'var(--shadow-soft)',
    gridTemplateColumns: columns
  } as const;
}

function EmptyState() {
  return (
    <section style={shellCardStyle()}>
      <p style={{ margin: 0, color: 'var(--muted)' }}>Монети / Dashboard</p>
      <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2.4rem' }}>
        Поки ще немає даних для статистики
      </h1>
      <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7, maxWidth: '46rem' }}>
        Dashboard вже готовий до роботи, але для графіків і агрегатів потрібна хоча б
        одна монета у колекції.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link
          href="/coins/collection/new"
          style={{
            borderRadius: '999px',
            padding: '0.8rem 1rem',
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            fontWeight: 600
          }}
        >
          Додати першу монету
        </Link>
        <Link
          href="/coins/collection"
          style={{
            borderRadius: '999px',
            padding: '0.8rem 1rem',
            border: '1px solid var(--border)',
            background: '#fff'
          }}
        >
          Відкрити колекцію
        </Link>
      </div>
    </section>
  );
}

function SummaryCards({ snapshot }: CoinsDashboardProps) {
  return (
    <section
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
      }}
    >
      <article style={shellCardStyle()}>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Усього монет</p>
        <strong className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 400 }}>
          {snapshot.totalCoins}
        </strong>
        <span style={{ color: 'var(--muted)' }}>Активна база для всіх інших віджетів.</span>
      </article>

      <article style={shellCardStyle()}>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Вкладення в USD</p>
        <strong className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 400 }}>
          {formatCompactUsd(snapshot.totalInvestmentUsd)}
        </strong>
        <span style={{ color: 'var(--muted)' }}>
          Перерахунок за `fx_usd_rate`, зафіксованим на дату придбання.
        </span>
      </article>

      <article style={shellCardStyle()}>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Вихідні валюти</p>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {snapshot.investmentTotals.map((item) => (
            <div
              key={item.currency}
              style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}
            >
              <span style={{ color: 'var(--muted)' }}>{item.currency === 'UAH' ? 'грн' : item.currency}</span>
              <strong>{formatMoney(item.amount, item.currency)}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

type BreakdownListProps =
  | {
      kind: 'category';
      items: DashboardCategoryBreakdownItem[];
    }
  | {
      kind: 'precious';
      items: DashboardPreciousBreakdownItem[];
    };

function BreakdownList({ items, kind }: BreakdownListProps) {
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  if (kind === 'category') {
    return (
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        {items.map((item) => {
          const width = `${Math.max((item.count / maxCount) * 100, 8)}%`;

          return (
            <div key={item.id} style={{ display: 'grid', gap: '0.35rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  alignItems: 'baseline'
                }}
              >
                <strong>{item.name}</strong>
                <span style={{ color: 'var(--muted)', textAlign: 'right' }}>
                  {item.count} шт. · {formatMoney(item.totalUsd, 'USD')}
                </span>
              </div>
              <div
                style={{
                  height: '0.7rem',
                  borderRadius: '999px',
                  background: 'var(--surface-muted)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width,
                    height: '100%',
                    borderRadius: '999px',
                    background: 'var(--accent)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      {items.map((item) => {
        const width = `${Math.max((item.count / maxCount) * 100, 8)}%`;

        return (
          <div key={item.key} style={{ display: 'grid', gap: '0.35rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                alignItems: 'baseline'
              }}
            >
              <strong>{item.label}</strong>
              <span style={{ color: 'var(--muted)', textAlign: 'right' }}>
                {item.count} шт. · {formatMoney(item.totalUsd, 'USD')}
              </span>
            </div>
            <div
              style={{
                height: '0.7rem',
                borderRadius: '999px',
                background: 'var(--surface-muted)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width,
                  height: '100%',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, var(--accent), var(--amber))'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CumulativeChart({ points }: { points: DashboardTimelinePoint[] }) {
  const maxValue = Math.max(...points.map((point) => point.cumulativeUsd), 1);
  const width = 100;
  const height = 44;
  const path = points
    .map((point, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width;
      const y = height - (point.cumulativeUsd / maxValue) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div style={{ display: 'grid', gap: '0.85rem' }}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Накопичені вкладення у часі">
        <path
          d={path}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          display: 'grid',
          gap: '0.65rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))'
        }}
      >
        {points.map((point) => (
          <div key={point.date} style={{ borderTop: '1px solid var(--border)', paddingTop: '0.65rem' }}>
            <strong>{point.date}</strong>
            <div style={{ color: 'var(--muted)' }}>
              +{formatMoney(point.totalUsd, 'USD')} · накопичено {formatMoney(point.cumulativeUsd, 'USD')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart<T>({
  items,
  getKey,
  getLabel,
  getValue,
  getSecondaryLabel
}: {
  items: T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  getValue: (item: T) => number;
  getSecondaryLabel: (item: T) => string;
}) {
  const maxValue = Math.max(...items.map((item) => getValue(item)), 1);

  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      {items.map((item) => {
        const value = getValue(item);
        const width = `${Math.max((value / maxValue) * 100, 8)}%`;

        return (
          <div key={getKey(item)} style={{ display: 'grid', gap: '0.35rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                alignItems: 'baseline'
              }}
            >
              <strong>{getLabel(item)}</strong>
              <span style={{ color: 'var(--muted)' }}>{getSecondaryLabel(item)}</span>
            </div>
            <div
              style={{
                height: '0.85rem',
                borderRadius: '999px',
                background: 'var(--surface-muted)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width,
                  height: '100%',
                  borderRadius: '999px',
                  background: 'var(--accent)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CoinsDashboard({ snapshot }: CoinsDashboardProps) {
  if (snapshot.totalCoins === 0) {
    return <EmptyState />;
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ display: 'grid', gap: '0.35rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Dashboard / Монети</p>
        <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2.4rem' }}>
          Зведення по колекції
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7, maxWidth: '56rem' }}>
          Це compositional dashboard: маршрут живе в `src/app/(app)/dashboard`, а coin-specific
          агрегати та віджети живуть у `src/features/coins/dashboard`.
        </p>
      </section>

      <SummaryCards snapshot={snapshot} />

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
        }}
      >
        <article style={shellCardStyle()}>
          <h2 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.7rem' }}>
            Категорії
          </h2>
          <BreakdownList items={snapshot.categoryBreakdown} kind="category" />
        </article>

        <article style={shellCardStyle()}>
          <h2 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.7rem' }}>
            Дорогоцінність
          </h2>
          <BreakdownList items={snapshot.preciousBreakdown} kind="precious" />
        </article>
      </section>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
        }}
      >
        <article style={shellCardStyle()}>
          <h2 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.7rem' }}>
            Останні додані
          </h2>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {snapshot.recentCoins.map((coin) => (
              <Link
                key={coin.id}
                href={`/coins/collection/${coin.id}`}
                style={{
                  display: 'grid',
                  gap: '0.25rem',
                  padding: '0.9rem 1rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--border)',
                  background: '#fff'
                }}
              >
                <strong>{coin.name}</strong>
                <span style={{ color: 'var(--muted)' }}>
                  {coin.categoryName ?? 'Без категорії'} · {coin.acquiredAt}
                </span>
                <span style={{ color: 'var(--muted)' }}>
                  {formatMoney(coin.purchaseAmount, coin.purchaseCurrency)}
                  {coin.mintYear ? ` · карбування ${coin.mintYear}` : ''}
                  {coin.isPrecious ? ' · дорогоцінна' : ''}
                </span>
              </Link>
            ))}
          </div>
        </article>

        <article style={shellCardStyle()}>
          <h2 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.7rem' }}>
            Накопичення у часі
          </h2>
          <CumulativeChart points={snapshot.cumulativeInvestmentTimeline} />
        </article>
      </section>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
        }}
      >
        <article style={shellCardStyle()}>
          <h2 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.7rem' }}>
            Вкладення за роками придбання
          </h2>
          <BarChart
            items={snapshot.acquiredYearSpend}
            getKey={(item) => item.year}
            getLabel={(item) => item.year}
            getValue={(item) => item.totalUsd}
            getSecondaryLabel={(item) => `${formatMoney(item.totalUsd, 'USD')} · ${item.count} шт.`}
          />
        </article>

        <article style={shellCardStyle()}>
          <h2 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.7rem' }}>
            Гістограма за роком карбування
          </h2>
          <BarChart
            items={snapshot.mintYearHistogram}
            getKey={(item) => item.year}
            getLabel={(item) => item.year}
            getValue={(item) => item.count}
            getSecondaryLabel={(item) => `${item.count} шт.`}
          />
        </article>
      </section>
    </div>
  );
}
