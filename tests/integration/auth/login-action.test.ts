import { describe, expect, it, vi } from 'vitest';
import {
  authenticateWithPassword,
  validateLoginCredentials
} from '@/features/auth/server/helpers';

describe('login action helpers', () => {
  it('validates malformed credentials before calling auth', () => {
    expect(
      validateLoginCredentials({
        email: 'wrong',
        password: 'short'
      })
    ).toEqual({
      success: false,
      error: null,
      fieldErrors: {
        email: 'Введіть коректний email.',
        password: 'Пароль має містити щонайменше 8 символів.'
      }
    });
  });

  it('returns a generic auth error when Supabase rejects the password sign-in', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      error: {
        message: 'Invalid login credentials'
      }
    });

    const result = await authenticateWithPassword(
      {
        auth: {
          signInWithPassword
        }
      },
      {
        email: 'owner@example.com',
        password: 'correct-horse-battery-staple'
      }
    );

    expect(signInWithPassword).toHaveBeenCalledOnce();
    expect(result).toEqual({
      success: false,
      error: 'Не вдалося увійти. Перевірте email, пароль і membership доступ.',
      fieldErrors: {}
    });
  });

  it('returns a success state when Supabase accepts the credentials', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      error: null
    });

    const result = await authenticateWithPassword(
      {
        auth: {
          signInWithPassword
        }
      },
      {
        email: 'owner@example.com',
        password: 'correct-horse-battery-staple'
      }
    );

    expect(result).toEqual({
      success: true,
      error: null,
      fieldErrors: {}
    });
  });
});
