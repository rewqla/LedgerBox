'use client';

import { useActionState } from 'react';
import {
  createWishlistItemAction,
  deleteWishlistItemAction,
  markWishlistItemPurchasedAction,
  updateWishlistItemAction
} from '@/features/coins/wishlist/server/actions';
import {
  INITIAL_WISHLIST_FORM_STATE,
  type WishlistFormState
} from '@/features/coins/wishlist/server/form-state';
import type { WishlistItem } from '@/features/coins/wishlist/server/queries';

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatPlainAmount(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

function WishlistRow({ item }: { item: WishlistItem }) {
  const updateAction = updateWishlistItemAction.bind(null, item.id);
  const deleteAction = deleteWishlistItemAction.bind(null, item.id);
  const markPurchasedAction = markWishlistItemPurchasedAction.bind(null, item.id);
  const [state, formAction, pending] = useActionState<WishlistFormState, FormData>(
    updateAction,
    INITIAL_WISHLIST_FORM_STATE
  );

  return (
    <article
      style={{
        display: 'grid',
        gap: '0.9rem',
        padding: '1.1rem',
        borderRadius: '1.15rem',
        border: '1px solid var(--border)',
        background: '#fff'
      }}
    >
      <form action={formAction} style={{ display: 'grid', gap: '0.8rem' }}>
        <div
          style={{
            display: 'grid',
            gap: '0.8rem',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1.65fr) minmax(160px, 0.8fr)'
          }}
        >
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>Монета</span>
            <input
              defaultValue={item.name}
              name="name"
              style={inputStyle}
              type="text"
            />
            {state.fieldErrors.name ? <span style={errorStyle}>{state.fieldErrors.name}</span> : null}
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>URL товару</span>
            <input
              defaultValue={item.url}
              name="url"
              style={inputStyle}
              type="url"
            />
            {state.fieldErrors.url ? <span style={errorStyle}>{state.fieldErrors.url}</span> : null}
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>Орієнтовна ціна</span>
            <input
              defaultValue={item.expectedPrice ?? ''}
              inputMode="decimal"
              min="0"
              name="expectedPrice"
              step="0.01"
              style={inputStyle}
              type="number"
            />
            {state.fieldErrors.expectedPrice ? (
              <span style={errorStyle}>{state.fieldErrors.expectedPrice}</span>
            ) : null}
          </label>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ color: 'var(--muted)', display: 'grid', gap: '0.2rem' }}>
            <a href={item.url} rel="noreferrer" style={{ color: 'var(--accent)' }} target="_blank">
              Відкрити товар
            </a>
            <span>
              {item.expectedPrice !== null
                ? `Орієнтир: ${formatPlainAmount(item.expectedPrice)}`
                : 'Без орієнтовної ціни'}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            <button
              disabled={pending}
              style={secondaryButtonStyle(pending)}
              type="submit"
            >
              {pending ? 'Збереження...' : 'Оновити'}
            </button>
            <button formAction={markPurchasedAction} style={accentButtonStyle(false)} type="submit">
              Придбано
            </button>
            <button formAction={deleteAction} style={dangerButtonStyle} type="submit">
              Видалити
            </button>
          </div>
        </div>

        {state.fieldErrors.form ? (
          <span style={errorStyle}>{state.fieldErrors.form}</span>
        ) : state.message ? (
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{state.message}</span>
        ) : null}
      </form>
    </article>
  );
}

export function WishlistManager({ items }: { items: WishlistItem[] }) {
  const [state, formAction, pending] = useActionState<WishlistFormState, FormData>(
    createWishlistItemAction,
    INITIAL_WISHLIST_FORM_STATE
  );

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ display: 'grid', gap: '0.35rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Монети / Бажанки</p>
        <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2.3rem' }}>
          Текстовий wishlist окремо від колекції
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7, maxWidth: '56rem' }}>
          У межах MVP бажанки навмисно залишаються без фото. Дія `Придбано` просто
          прибирає запис зі списку, а one-click transfer у колекцію свідомо лишено як
          stretch-покращення після MVP.
        </p>
      </section>

      <form
        action={formAction}
        style={{
          display: 'grid',
          gap: '1rem',
          padding: '1.25rem',
          borderRadius: '1.35rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-soft)'
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '0.85rem',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.6fr) minmax(180px, 0.7fr)'
          }}
        >
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>Назва монети</span>
            <input name="name" placeholder="Наприклад, 5 гривень" style={inputStyle} type="text" />
            {state.fieldErrors.name ? <span style={errorStyle}>{state.fieldErrors.name}</span> : null}
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>URL на товар</span>
            <input
              name="url"
              placeholder="https://..."
              style={inputStyle}
              type="url"
            />
            {state.fieldErrors.url ? <span style={errorStyle}>{state.fieldErrors.url}</span> : null}
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>Орієнтовна ціна</span>
            <input
              inputMode="decimal"
              min="0"
              name="expectedPrice"
              placeholder="120.00"
              step="0.01"
              style={inputStyle}
              type="number"
            />
            {state.fieldErrors.expectedPrice ? (
              <span style={errorStyle}>{state.fieldErrors.expectedPrice}</span>
            ) : null}
          </label>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ color: 'var(--muted)' }}>
            {state.fieldErrors.form ? (
              <span style={errorStyle}>{state.fieldErrors.form}</span>
            ) : state.message ? (
              <span>{state.message}</span>
            ) : (
              <span>Wishlist навмисно текстовий: без фото та без автоматичного трансферу в колекцію.</span>
            )}
          </div>

          <button disabled={pending} style={accentButtonStyle(pending)} type="submit">
            {pending ? 'Додавання...' : 'Додати в бажанки'}
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <section
          style={{
            padding: '1.5rem',
            borderRadius: '1.25rem',
            border: '1px dashed var(--border-strong)',
            background: 'var(--surface)'
          }}
        >
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>
            Поки що список бажанок порожній. Додай монету, яку ще шукаєш, з посиланням
            на джерело або магазин.
          </p>
        </section>
      ) : (
        <section style={{ display: 'grid', gap: '0.85rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '0.75rem',
              alignItems: 'baseline'
            }}
          >
            <h2 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.7rem' }}>
              Список бажанок
            </h2>
            <span style={{ color: 'var(--muted)' }}>
              {items.length} {items.length === 1 ? 'позиція' : items.length < 5 ? 'позиції' : 'позицій'}
            </span>
          </div>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {items.map((item) => (
              <WishlistRow item={item} key={item.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const inputStyle = {
  border: '1px solid var(--border)',
  borderRadius: '0.9rem',
  padding: '0.8rem 0.95rem',
  background: '#fff'
} as const;

const errorStyle = {
  color: 'var(--danger)',
  fontSize: '0.88rem'
} as const;

function accentButtonStyle(pending: boolean) {
  return {
    borderRadius: '999px',
    padding: '0.8rem 1rem',
    background: pending ? 'var(--accent-strong)' : 'var(--accent)',
    color: 'var(--accent-foreground)',
    cursor: pending ? 'wait' : 'pointer'
  } as const;
}

function secondaryButtonStyle(pending: boolean) {
  return {
    borderRadius: '999px',
    padding: '0.78rem 1rem',
    border: '1px solid var(--border)',
    background: pending ? 'var(--surface-muted)' : '#fff',
    cursor: pending ? 'wait' : 'pointer'
  } as const;
}

const dangerButtonStyle = {
  borderRadius: '999px',
  padding: '0.78rem 1rem',
  border: '1px solid rgba(180, 35, 24, 0.22)',
  background: 'rgba(180, 35, 24, 0.08)',
  color: 'var(--danger)'
} as const;
