'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/features/auth/server/actions';

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await logoutAction();
        });
      }}
      style={{
        border: '1px solid var(--border)',
        borderRadius: '999px',
        padding: '0.7rem 1rem',
        background: '#fff',
        cursor: pending ? 'wait' : 'pointer'
      }}
      type="button"
    >
      {pending ? 'Вихід...' : 'Вийти'}
    </button>
  );
}
