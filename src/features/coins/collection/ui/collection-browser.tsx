'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { normalizeCollectionViewMode } from '@/features/coins/collection/server/filters';
import {
  COLLECTION_VIEW_STORAGE_KEY,
  type CollectionCoinListItem,
  type CollectionFilters,
  type CollectionViewMode
} from '@/features/coins/collection/server/types';
import { ViewModeToggle } from '@/features/coins/collection/ui/view-mode-toggle';
import { PhotoSlotPreview } from '@/features/coins/collection/ui/photo-slot-preview';

type CollectionBrowserProps = {
  coins: CollectionCoinListItem[];
  filters: CollectionFilters;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'medium'
  }).format(new Date(date));
}

function PreciousBadge({
  precious,
  metalType
}: {
  precious: boolean;
  metalType: CollectionCoinListItem['preciousMetalType'];
}) {
  if (!precious) {
    return (
      <span
        style={{
          borderRadius: '999px',
          padding: '0.25rem 0.6rem',
          background: 'var(--surface-muted)',
          color: 'var(--muted)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}
      >
        Звичайна
      </span>
    );
  }

  return (
    <span
      style={{
        borderRadius: '999px',
        padding: '0.25rem 0.6rem',
        background: 'var(--amber-soft)',
        color: 'var(--amber)',
        fontSize: '0.85rem',
        fontWeight: 600
      }}
    >
      {metalType ? metalType.toUpperCase() : 'PRECIOUS'}
    </span>
  );
}

export function CollectionBrowser({
  coins,
  filters
}: CollectionBrowserProps) {
  const [viewMode, setViewMode] = useState<CollectionViewMode>('cards');

  useEffect(() => {
    const savedMode = window.localStorage.getItem(COLLECTION_VIEW_STORAGE_KEY);
    setViewMode(normalizeCollectionViewMode(savedMode));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(COLLECTION_VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <strong style={{ fontSize: '1.05rem' }}>
            Знайдено монет: {coins.length}
          </strong>
          <span style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>
            Пошукова і фільтраційна логіка належить тільки фічі `coins/collection`.
          </span>
        </div>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {coins.length === 0 ? (
        <section
          style={{
            padding: '2rem',
            borderRadius: '1.5rem',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <h2 className="font-serif" style={{ marginTop: 0, fontWeight: 400 }}>
            Нічого не знайдено
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>
            Спробуйте змінити пошуковий запит або скинути фільтри. Поточний пошук:
            {' '}
            <strong>{filters.search || 'без текстового фільтра'}</strong>.
          </p>
        </section>
      ) : viewMode === 'cards' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
            gap: '1rem'
          }}
        >
          {coins.map((coin) => (
            <Link
              key={coin.id}
              href={`/coins/collection/${coin.id}`}
              style={{
                display: 'grid',
                gap: '1rem',
                padding: '1.15rem',
                borderRadius: '1.4rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-soft)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {coin.category?.name ?? 'Без категорії'}
                </span>
                <PreciousBadge
                  precious={coin.isPrecious}
                  metalType={coin.preciousMetalType}
                />
              </div>

              <div style={{ display: 'grid', gap: '0.45rem' }}>
                <h3 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.45rem' }}>
                  {coin.name}
                </h3>
                <span style={{ color: 'var(--muted)' }}>
                  Рік карбування: {coin.mintYear ?? 'невідомо'}
                </span>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem'
                  }}
                >
                  <PhotoSlotPreview label="Аверс" path={coin.obversePhotoPath} />
                  <PhotoSlotPreview label="Реверс" path={coin.reversePhotoPath} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{formatDate(coin.acquiredAt)}</span>
                  <strong>{formatMoney(coin.purchaseAmount, coin.purchaseCurrency)}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            borderRadius: '1.25rem',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-muted)', color: 'var(--muted)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Назва</th>
                <th style={{ padding: '1rem' }}>Рік</th>
                <th style={{ padding: '1rem' }}>Категорія</th>
                <th style={{ padding: '1rem' }}>Статус</th>
                <th style={{ padding: '1rem' }}>Фото</th>
                <th style={{ padding: '1rem' }}>Придбано</th>
                <th style={{ padding: '1rem' }}>Сума</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin) => {
                const photoCount = Number(Boolean(coin.obversePhotoPath)) + Number(Boolean(coin.reversePhotoPath));

                return (
                  <tr key={coin.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/coins/collection/${coin.id}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        {coin.name}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem' }}>{coin.mintYear ?? '—'}</td>
                    <td style={{ padding: '1rem' }}>{coin.category?.name ?? '—'}</td>
                    <td style={{ padding: '1rem' }}>
                      <PreciousBadge precious={coin.isPrecious} metalType={coin.preciousMetalType} />
                    </td>
                    <td style={{ padding: '1rem' }}>{photoCount}/2</td>
                    <td style={{ padding: '1rem' }}>{formatDate(coin.acquiredAt)}</td>
                    <td style={{ padding: '1rem' }}>{formatMoney(coin.purchaseAmount, coin.purchaseCurrency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
