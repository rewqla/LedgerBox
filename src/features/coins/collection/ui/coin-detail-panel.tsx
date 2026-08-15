import { PhotoSlotPreview } from '@/features/coins/collection/ui/photo-slot-preview';
import type { CollectionCoinDetail } from '@/features/coins/collection/server/types';

type CoinDetailPanelProps = {
  coin: CollectionCoinDetail;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

export function CoinDetailPanel({ coin }: CoinDetailPanelProps) {
  return (
    <section
      style={{
        display: 'grid',
        gap: '1.5rem',
        padding: '1.8rem',
        borderRadius: '1.5rem',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-soft)'
      }}
    >
      <div style={{ display: 'grid', gap: '0.45rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)' }}>
          {coin.category?.name ?? 'Без категорії'}
        </p>
        <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2.25rem' }}>
          {coin.name}
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>
          Детальна картка показує всі поля монети з двома окремими слотами для фото:
          аверс і реверс.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '1rem'
        }}
      >
        <PhotoSlotPreview label="Аверс" path={coin.obversePhotoPath} />
        <PhotoSlotPreview label="Реверс" path={coin.reversePhotoPath} />
      </div>

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '1rem'
        }}
      >
        <div>
          <dt style={{ color: 'var(--muted)' }}>Рік карбування</dt>
          <dd style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>{coin.mintYear ?? 'Невідомо'}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--muted)' }}>Дата придбання</dt>
          <dd style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>{coin.acquiredAt}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--muted)' }}>Сума придбання</dt>
          <dd style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>
            {formatMoney(coin.purchaseAmount, coin.purchaseCurrency)}
          </dd>
        </div>
        <div>
          <dt style={{ color: 'var(--muted)' }}>Курс USD</dt>
          <dd style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>{coin.fxUsdRate}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--muted)' }}>Дорогоцінний статус</dt>
          <dd style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>
            {coin.isPrecious ? `Так, ${coin.preciousMetalType ?? 'metal n/a'}` : 'Ні'}
          </dd>
        </div>
        <div>
          <dt style={{ color: 'var(--muted)' }}>Вага дорогоцінного металу</dt>
          <dd style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>
            {coin.preciousMetalWeightG ?? '—'}
          </dd>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <dt style={{ color: 'var(--muted)' }}>Нотатки</dt>
          <dd style={{ margin: '0.35rem 0 0', lineHeight: 1.7 }}>
            {coin.notes || 'Поки без нотаток.'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
