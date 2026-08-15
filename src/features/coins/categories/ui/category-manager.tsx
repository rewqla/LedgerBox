'use client';

import { useActionState } from 'react';
import {
  createCategoryAction,
  INITIAL_CATEGORY_FORM_STATE,
  renameCategoryAction,
  type CategoryFormState
} from '@/features/coins/categories/server/actions';
import type { CategoryListItem } from '@/features/coins/categories/server/queries';

function CategoryRow({
  category
}: {
  category: CategoryListItem;
}) {
  const rename = renameCategoryAction.bind(null, category.id);
  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(
    rename,
    INITIAL_CATEGORY_FORM_STATE
  );

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: '0.75rem',
        alignItems: 'center',
        padding: '0.9rem',
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        background: '#fff'
      }}
    >
      <div style={{ display: 'grid', gap: '0.35rem' }}>
        <input
          defaultValue={category.name}
          name="name"
          style={{
            border: '1px solid var(--border)',
            borderRadius: '0.85rem',
            padding: '0.7rem 0.9rem'
          }}
          type="text"
        />
        {state.fieldErrors.name ? (
          <span style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>{state.fieldErrors.name}</span>
        ) : state.message ? (
          <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{state.message}</span>
        ) : null}
      </div>

      <button
        disabled={pending}
        style={{
          borderRadius: '999px',
          padding: '0.75rem 1rem',
          border: '1px solid var(--border)',
          background: pending ? 'var(--surface-muted)' : '#fff',
          cursor: pending ? 'wait' : 'pointer'
        }}
        type="submit"
      >
        {pending ? 'Збереження...' : 'Перейменувати'}
      </button>
    </form>
  );
}

export function CategoryManager({
  categories
}: {
  categories: CategoryListItem[];
}) {
  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    INITIAL_CATEGORY_FORM_STATE
  );

  return (
    <section
      style={{
        display: 'grid',
        gap: '1rem'
      }}
    >
      <form
        action={formAction}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: '0.75rem',
          alignItems: 'start',
          padding: '1.2rem',
          borderRadius: '1.25rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)'
        }}
      >
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <input
            name="name"
            placeholder="Нова категорія"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '0.85rem',
              padding: '0.8rem 0.95rem'
            }}
            type="text"
          />
          {state.fieldErrors.name ? (
            <span style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>{state.fieldErrors.name}</span>
          ) : state.message ? (
            <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{state.message}</span>
          ) : null}
        </div>

        <button
          disabled={pending}
          style={{
            borderRadius: '999px',
            padding: '0.8rem 1rem',
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            cursor: pending ? 'wait' : 'pointer'
          }}
          type="submit"
        >
          {pending ? 'Створення...' : 'Додати'}
        </button>
      </form>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
