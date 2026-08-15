'use client';

import type { CSSProperties } from 'react';
import { useActionState } from 'react';
import {
  INITIAL_LOGIN_STATE,
  loginAction
} from '@/features/auth/server/actions';

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: '0.9rem',
  border: '1px solid var(--border)',
  background: '#fff'
};

const labelStyle: CSSProperties = {
  display: 'grid',
  gap: '0.45rem',
  color: 'var(--muted)',
  fontSize: '0.95rem'
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_LOGIN_STATE);

  return (
    <form action={formAction} style={{ display: 'grid', gap: '1rem' }}>
      <label style={labelStyle}>
        Email
        <input
          aria-invalid={Boolean(state.fieldErrors.email)}
          autoComplete="email"
          name="email"
          placeholder="owner@example.com"
          required
          style={inputStyle}
          type="email"
        />
        {state.fieldErrors.email ? (
          <span style={{ color: 'var(--danger)' }}>{state.fieldErrors.email}</span>
        ) : null}
      </label>

      <label style={labelStyle}>
        Пароль
        <input
          aria-invalid={Boolean(state.fieldErrors.password)}
          autoComplete="current-password"
          name="password"
          required
          style={inputStyle}
          type="password"
        />
        {state.fieldErrors.password ? (
          <span style={{ color: 'var(--danger)' }}>{state.fieldErrors.password}</span>
        ) : null}
      </label>

      {state.error ? (
        <div
          role="alert"
          style={{
            borderRadius: '0.9rem',
            padding: '0.85rem 1rem',
            background: '#fef3f2',
            color: 'var(--danger)'
          }}
        >
          {state.error}
        </div>
      ) : null}

      <button
        disabled={pending}
        style={{
          border: 0,
          borderRadius: '999px',
          padding: '0.95rem 1.25rem',
          background: 'var(--accent)',
          color: 'var(--accent-foreground)',
          fontWeight: 600,
          cursor: pending ? 'wait' : 'pointer'
        }}
        type="submit"
      >
        {pending ? 'Вхід...' : 'Увійти'}
      </button>
    </form>
  );
}
