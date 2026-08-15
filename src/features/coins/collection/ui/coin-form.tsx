'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import type { CollectionCoinDetail } from '@/features/coins/collection/server/types';
import {
  createCoinAction,
  deleteCoinAction,
  updateCoinAction
} from '@/features/coins/collection/server/actions';
import { getInitialCoinFormValues } from '@/features/coins/collection/server/helpers';
import {
  INITIAL_COIN_FORM_STATE,
  type CoinFormState
} from '@/features/coins/collection/server/form-state';
import { LocalPhotoInput } from '@/features/coins/photos/ui/local-photo-input';

type CoinFormProps = {
  categories: Array<{
    id: string;
    name: string;
  }>;
  coin: CollectionCoinDetail | null;
  mode: 'create' | 'edit';
};

export function CoinForm({ categories, coin, mode }: CoinFormProps) {
  const initial = getInitialCoinFormValues(coin);
  const router = useRouter();
  const [state, setState] = useState<CoinFormState>(INITIAL_COIN_FORM_STATE);
  const [pending, setPending] = useState(false);
  const [obverseFile, setObverseFile] = useState<File | null>(null);
  const [reverseFile, setReverseFile] = useState<File | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        if (obverseFile) {
          formData.set('obversePhotoFile', obverseFile, obverseFile.name);
        }

        if (reverseFile) {
          formData.set('reversePhotoFile', reverseFile, reverseFile.name);
        }

        setPending(true);
        setState(INITIAL_COIN_FORM_STATE);

        startTransition(async () => {
          try {
            const result =
              mode === 'create'
                ? await createCoinAction(INITIAL_COIN_FORM_STATE, formData)
                : await updateCoinAction(coin!.id, INITIAL_COIN_FORM_STATE, formData);

            setState(result);
          } finally {
            setPending(false);
            router.refresh();
          }
        });
      }}
      style={{ display: 'grid', gap: '1.25rem' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '1rem'
        }}
      >
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>Назва</span>
          <input defaultValue={initial.name} name="name" style={inputStyle} type="text" />
          {state.fieldErrors.name ? <span style={errorStyle}>{state.fieldErrors.name}</span> : null}
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>Категорія</span>
          <select defaultValue={initial.categoryId} name="categoryId" style={inputStyle}>
            <option value="">Оберіть категорію</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {state.fieldErrors.categoryId ? (
            <span style={errorStyle}>{state.fieldErrors.categoryId}</span>
          ) : null}
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>Рік карбування</span>
          <input
            defaultValue={initial.mintYear ?? ''}
            name="mintYear"
            style={inputStyle}
            type="number"
          />
          {state.fieldErrors.mintYear ? <span style={errorStyle}>{state.fieldErrors.mintYear}</span> : null}
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>Дата придбання</span>
          <input defaultValue={initial.acquiredAt} name="acquiredAt" style={inputStyle} type="date" />
          {state.fieldErrors.acquiredAt ? (
            <span style={errorStyle}>{state.fieldErrors.acquiredAt}</span>
          ) : null}
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>Сума придбання</span>
          <input
            defaultValue={initial.purchaseAmount}
            min="0"
            name="purchaseAmount"
            step="0.01"
            style={inputStyle}
            type="number"
          />
          {state.fieldErrors.purchaseAmount ? (
            <span style={errorStyle}>{state.fieldErrors.purchaseAmount}</span>
          ) : null}
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>Валюта</span>
          <select defaultValue={initial.purchaseCurrency} name="purchaseCurrency" style={inputStyle}>
            <option value="UAH">UAH</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          {state.fieldErrors.purchaseCurrency ? (
            <span style={errorStyle}>{state.fieldErrors.purchaseCurrency}</span>
          ) : null}
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>Курс USD</span>
          <input
            defaultValue={initial.fxUsdRate}
            min="0.000001"
            name="fxUsdRate"
            step="0.000001"
            style={inputStyle}
            type="number"
          />
          {state.fieldErrors.fxUsdRate ? <span style={errorStyle}>{state.fieldErrors.fxUsdRate}</span> : null}
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            paddingTop: '1.9rem'
          }}
        >
          <input defaultChecked={initial.isPrecious} name="isPrecious" type="checkbox" />
          <span>Дорогоцінна монета</span>
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>Тип дорогоцінного металу</span>
          <select defaultValue={initial.preciousMetalType ?? ''} name="preciousMetalType" style={inputStyle}>
            <option value="">Не обрано</option>
            <option value="gold">gold</option>
            <option value="silver">silver</option>
            <option value="platinum">platinum</option>
          </select>
          {state.fieldErrors.preciousMetalType ? (
            <span style={errorStyle}>{state.fieldErrors.preciousMetalType}</span>
          ) : null}
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>Вага дорогоцінного металу, г</span>
          <input
            defaultValue={initial.preciousMetalWeightG ?? ''}
            min="0"
            name="preciousMetalWeightG"
            step="0.001"
            style={inputStyle}
            type="number"
          />
          {state.fieldErrors.preciousMetalWeightG ? (
            <span style={errorStyle}>{state.fieldErrors.preciousMetalWeightG}</span>
          ) : null}
        </label>
      </div>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span>Нотатки</span>
        <textarea
          defaultValue={initial.notes}
          name="notes"
          rows={5}
          style={{
            ...inputStyle,
            resize: 'vertical'
          }}
        />
      </label>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          padding: '1.25rem',
          borderRadius: '1.25rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)'
        }}
      >
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <h2 className="font-serif" style={{ margin: 0, fontWeight: 400 }}>
            Фото монети
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
            Кожен слот підтримує або локальний файл з client-side обробкою, або URL-імпорт.
            У MVP існує лише два окремі слоти: аверс і реверс.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <LocalPhotoInput
              helper={coin?.obversePhotoPath ? `Поточний шлях: ${coin.obversePhotoPath}` : 'Локальний файл буде оброблено до WebP ≤ 1 MB.'}
              inputName="obversePhotoFilePicker"
              label="Аверс: локальний файл"
              onProcessedFileChange={setObverseFile}
            />
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span>Аверс: URL-імпорт</span>
              <input defaultValue={initial.obversePhotoUrl} name="obversePhotoUrl" style={inputStyle} type="url" />
              {state.fieldErrors.obversePhotoFile ? (
                <span style={errorStyle}>{state.fieldErrors.obversePhotoFile}</span>
              ) : null}
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input name="removeObversePhoto" type="checkbox" />
              <span>Видалити аверс</span>
            </label>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <LocalPhotoInput
              helper={coin?.reversePhotoPath ? `Поточний шлях: ${coin.reversePhotoPath}` : 'Локальний файл буде оброблено до WebP ≤ 1 MB.'}
              inputName="reversePhotoFilePicker"
              label="Реверс: локальний файл"
              onProcessedFileChange={setReverseFile}
            />
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span>Реверс: URL-імпорт</span>
              <input defaultValue={initial.reversePhotoUrl} name="reversePhotoUrl" style={inputStyle} type="url" />
              {state.fieldErrors.reversePhotoFile ? (
                <span style={errorStyle}>{state.fieldErrors.reversePhotoFile}</span>
              ) : null}
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input name="removeReversePhoto" type="checkbox" />
              <span>Видалити реверс</span>
            </label>
          </div>
        </div>
      </section>

      {state.message ? (
        <div
          style={{
            padding: '0.9rem 1rem',
            borderRadius: '1rem',
            background: '#fef3f2',
            color: 'var(--danger)'
          }}
        >
          {state.message}
        </div>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <button
          disabled={pending}
          style={{
            borderRadius: '999px',
            padding: '0.85rem 1.15rem',
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            cursor: pending ? 'wait' : 'pointer'
          }}
          type="submit"
        >
          {pending ? 'Збереження...' : mode === 'create' ? 'Створити монету' : 'Зберегти зміни'}
        </button>
        <Link
          href={coin ? `/coins/collection/${coin.id}` : '/coins/collection'}
          style={{
            borderRadius: '999px',
            padding: '0.85rem 1.15rem',
            border: '1px solid var(--border)',
            background: '#fff'
          }}
        >
          Скасувати
        </Link>

        {mode === 'edit' && coin ? (
          <button
            onClick={(event) => {
              event.preventDefault();
              if (!window.confirm('Видалити монету разом із фото?')) {
                return;
              }

              setPending(true);
              startTransition(async () => {
                try {
                  await deleteCoinAction(coin.id);
                } finally {
                  setPending(false);
                }
              });
            }}
            style={{
              borderRadius: '999px',
              padding: '0.85rem 1.15rem',
              border: '1px solid rgba(180, 35, 24, 0.25)',
              background: '#fff5f5',
              color: 'var(--danger)',
              cursor: 'pointer'
            }}
            type="button"
          >
            Видалити монету
          </button>
        ) : null}
      </div>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--border)',
  borderRadius: '0.9rem',
  padding: '0.8rem 0.95rem',
  background: '#fff'
};

const errorStyle: React.CSSProperties = {
  color: 'var(--danger)',
  fontSize: '0.88rem'
};
