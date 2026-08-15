import { getPreciousFilterLabel } from '@/features/coins/collection/server/filters';
import type { CollectionFilterOptions, CollectionFilters } from '@/features/coins/collection/server/types';

type CollectionFiltersFormProps = {
  filters: CollectionFilters;
  options: CollectionFilterOptions;
};

export function CollectionFiltersForm({
  filters,
  options
}: CollectionFiltersFormProps) {
  const preciousOptions = ['all', 'precious', 'ordinary', 'gold', 'silver', 'platinum'] as const;

  return (
    <form
      action="/coins/collection"
      style={{
        display: 'grid',
        gap: '1rem',
        padding: '1.2rem',
        borderRadius: '1.25rem',
        border: '1px solid var(--border)',
        background: 'var(--surface)'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(14rem, 2.2fr) repeat(3, minmax(10rem, 1fr)) auto',
          gap: '0.85rem',
          alignItems: 'end'
        }}
      >
        <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--muted)' }}>
          Пошук за назвою
          <input
            defaultValue={filters.search}
            name="search"
            placeholder="Наприклад: гривня, доллар, eagle"
            style={{
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: '0.9rem',
              padding: '0.8rem 0.95rem',
              background: '#fff'
            }}
            type="search"
          />
        </label>

        <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--muted)' }}>
          Рік
          <select
            defaultValue={filters.year}
            name="year"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '0.9rem',
              padding: '0.8rem 0.95rem',
              background: '#fff'
            }}
          >
            <option value="all">Усі роки</option>
            {options.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--muted)' }}>
          Категорія
          <select
            defaultValue={filters.categoryId}
            name="categoryId"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '0.9rem',
              padding: '0.8rem 0.95rem',
              background: '#fff'
            }}
          >
            <option value="all">Усі категорії</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--muted)' }}>
          Дорогоцінний метал
          <select
            defaultValue={filters.precious}
            name="precious"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '0.9rem',
              padding: '0.8rem 0.95rem',
              background: '#fff'
            }}
          >
            {preciousOptions.map((option) => (
              <option key={option} value={option}>
                {getPreciousFilterLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            style={{
              borderRadius: '999px',
              padding: '0.8rem 1rem',
              background: 'var(--accent)',
              color: 'var(--accent-foreground)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            type="submit"
          >
            Застосувати
          </button>
          <a
            href="/coins/collection"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '999px',
              padding: '0.8rem 1rem',
              border: '1px solid var(--border)',
              background: '#fff'
            }}
          >
            Скинути
          </a>
        </div>
      </div>
    </form>
  );
}
