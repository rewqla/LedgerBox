'use client';

import { useRef, useState } from 'react';
import { processLocalPhoto } from '@/features/coins/photos/client/process-local-photo';

type LocalPhotoInputProps = {
  label: string;
  inputName: string;
  helper: string;
  onProcessedFileChange: (file: File | null) => void;
};

export function LocalPhotoInput({
  label,
  inputName,
  helper,
  onProcessedFileChange
}: LocalPhotoInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>(helper);
  const [pending, setPending] = useState(false);

  return (
    <label
      style={{
        display: 'grid',
        gap: '0.45rem',
        padding: '0.9rem',
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        background: '#fff'
      }}
    >
      <strong>{label}</strong>
      <input
        ref={inputRef}
        accept="image/*"
        name={inputName}
        onChange={async (event) => {
          const selected = event.currentTarget.files?.[0] ?? null;

          if (!selected) {
            onProcessedFileChange(null);
            setStatus(helper);
            return;
          }

          setPending(true);

          try {
            const processed = await processLocalPhoto(selected);
            onProcessedFileChange(processed);
            setStatus(`Готово: ${processed.name} (${Math.round(processed.size / 1024)} KB, WebP)`);
          } catch (error) {
            onProcessedFileChange(null);
            setStatus(error instanceof Error ? error.message : 'Не вдалося обробити локальне фото.');
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          } finally {
            setPending(false);
          }
        }}
        style={{
          border: '1px solid var(--border)',
          borderRadius: '0.85rem',
          padding: '0.7rem'
        }}
        type="file"
      />
      <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
        {pending ? 'Обробка фото...' : status}
      </span>
    </label>
  );
}
