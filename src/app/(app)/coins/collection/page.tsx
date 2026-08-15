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
      <CollectionBrowser coins={coins} filters={filters} />
    </div>
  );
}
