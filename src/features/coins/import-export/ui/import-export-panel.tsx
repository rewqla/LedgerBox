'use client';

import { useActionState } from 'react';
import {
  INITIAL_IMPORT_COINS_FORM_STATE,
  type ImportCoinsFormState
} from '@/features/coins/import-export/server/form-state';
import { importCoinsAction } from '@/features/coins/import-export/server/actions';

export function ImportExportPanel() {
  const [state, formAction, pending] = useActionState<ImportCoinsFormState, FormData>(
    importCoinsAction,
    INITIAL_IMPORT_COINS_FORM_STATE
  );

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ display: 'grid', gap: '0.35rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Монети / Імпорт та експорт</p>
        <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2.35rem' }}>
          JSON-перенесення колекції без фото
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7, maxWidth: '58rem' }}>
          Для MVP експорт працює у форматі JSON. Фото та photo paths навмисно не
          входять у переносимий payload, а повторний імпорт не зливає записи і не
          оновлює існуючі монети: дублікати просто пропускаються з поміткою у звіті.
        </p>
      </section>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          padding: '1.35rem',
          borderRadius: '1.35rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-soft)'
        }}
      >
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <h2 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.75rem' }}>
            Експорт
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>
            Вивантажує всю спільну колекцію у `ledgerbox-coins-export.json` для резервного
            копіювання, перенесення або масового редагування поза UI.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <a
            href="/api/coins/collection/export"
            style={{
              borderRadius: '999px',
              padding: '0.8rem 1rem',
              background: 'var(--accent)',
              color: 'var(--accent-foreground)',
              fontWeight: 600
            }}
          >
            Завантажити JSON-експорт
          </a>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          padding: '1.35rem',
          borderRadius: '1.35rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-soft)'
        }}
      >
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <h2 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '1.75rem' }}>
            Імпорт
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>
            Імпортує тільки текстові поля монет. Якщо у JSON є некоректні елементи або
            дублікати, вони не ламають весь процес: кожен рядок потрапляє у звіт окремо.
          </p>
        </div>

        <form action={formAction} style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>JSON-файл експорту</span>
            <input
              accept="application/json,.json"
              name="file"
              style={{
                border: '1px solid var(--border)',
                borderRadius: '0.95rem',
                padding: '0.85rem 1rem',
                background: '#fff'
              }}
              type="file"
            />
            {state.fieldErrors.file ? (
              <span style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{state.fieldErrors.file}</span>
            ) : null}
          </label>

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
              {state.message ?? 'Файл має бути у форматі MVP JSON-експорту LedgerBox.'}
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
              {pending ? 'Імпорт триває...' : 'Імпортувати файл'}
            </button>
          </div>
        </form>

        {state.summary ? (
          <section
            style={{
              display: 'grid',
              gap: '0.75rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border)'
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: '0.75rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))'
              }}
            >
              <SummaryCard label="Усього рядків" value={String(state.summary.total)} />
              <SummaryCard label="Імпортовано" value={String(state.summary.imported)} />
              <SummaryCard label="Пропущено" value={String(state.summary.skipped)} />
              <SummaryCard label="Помилки" value={String(state.summary.errors)} />
            </div>

            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {state.report.map((item) => (
                <article
                  key={`${item.rowNumber}:${item.name}:${item.status}`}
                  style={{
                    display: 'grid',
                    gap: '0.25rem',
                    padding: '0.9rem 1rem',
                    borderRadius: '1rem',
                    border: '1px solid var(--border)',
                    background: '#fff'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.65rem',
                      justifyContent: 'space-between',
                      alignItems: 'baseline'
                    }}
                  >
                    <strong>
                      #{item.rowNumber} · {item.name}
                    </strong>
                    <span
                      style={{
                        color:
                          item.status === 'imported'
                            ? 'var(--accent)'
                            : item.status === 'skipped'
                              ? 'var(--muted)'
                              : 'var(--danger)'
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <span style={{ color: 'var(--muted)' }}>{item.message}</span>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article
      style={{
        display: 'grid',
        gap: '0.35rem',
        padding: '1rem',
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        background: '#fff'
      }}
    >
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <strong className="font-serif" style={{ fontWeight: 400, fontSize: '1.8rem' }}>
        {value}
      </strong>
    </article>
  );
}
