'use client';

import type { CollectionViewMode } from '@/features/coins/collection/server/types';

type ViewModeToggleProps = {
  value: CollectionViewMode;
  onChange: (next: CollectionViewMode) => void;
};

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const modes: Array<{ value: CollectionViewMode; label: string }> = [
    { value: 'cards', label: 'Картки' },
    { value: 'table', label: 'Таблиця' }
  ];

  return (
    <div
      aria-label="Режим відображення"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        borderRadius: '999px',
        padding: '0.25rem',
        background: 'var(--surface-muted)',
        border: '1px solid var(--border)'
      }}
    >
      {modes.map((mode) => {
        const active = value === mode.value;

        return (
          <button
            key={mode.value}
            aria-pressed={active}
            onClick={() => onChange(mode.value)}
            style={{
              borderRadius: '999px',
              padding: '0.55rem 0.9rem',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--accent-foreground)' : 'var(--foreground)',
              fontWeight: active ? 600 : 500,
              cursor: 'pointer'
            }}
            type="button"
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
