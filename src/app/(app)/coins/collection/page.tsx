import Link from 'next/link';
import { CollectionBrowser } from '@/features/coins/collection/ui/collection-browser';
import { CollectionFiltersForm } from '@/features/coins/collection/ui/collection-filters-form';
import { normalizeCollectionFilters } from '@/features/coins/collection/server/filters';
import {
  getCollectionFilterOptions,
  listCollectionCoins
} from '@/features/coins/collection/server/queries';
import type { CollectionSearchParams } from '@/features/coins/collection/server/types';

export const dynamic = 'force-dynamic';

type CollectionPageProps = {
  searchParams: Promise<CollectionSearchParams>;
};

export default async function CoinsCollectionPage({
  searchParams
}: CollectionPageProps) {
  const filters = normalizeCollectionFilters(await searchParams);
  const [coins, filterOptions] = await Promise.all([
    listCollectionCoins(filters),
    getCollectionFilterOptions()
  ]);

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ display: 'grid', gap: '0.35rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Монети / Колекція</p>
        <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2.4rem' }}>
          Перегляд і пошук колекції
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7, maxWidth: '56rem' }}>
          Пошук за назвою, фільтри за роком, категорією і дорогоцінним статусом
          належать тільки фічі `coins/collection` і не винесені в shared-доменну логіку.
        </p>
      </section>

      <CollectionFiltersForm filters={filters} options={filterOptions} />
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
          Додати монету
        </Link>
        <Link
          href="/coins/collection/categories"
          style={{
            borderRadius: '999px',
            padding: '0.8rem 1rem',
            border: '1px solid var(--border)',
            background: '#fff'
          }}
        >
          Керувати категоріями
        </Link>
      </div>
      <CollectionBrowser coins={coins} filters={filters} />
    </div>
  );
}
