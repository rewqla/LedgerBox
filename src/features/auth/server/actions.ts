'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/shared/supabase/server';
import {
  authenticateWithPassword,
  type LoginCredentials,
  type LoginFormState
} from '@/features/auth/server/helpers';
export { INITIAL_LOGIN_STATE } from '@/features/auth/server/helpers';

function getTrimmedCredentials(formData: FormData): LoginCredentials {
  return {
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    password: String(formData.get('password') ?? '')
  };
}

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const credentials = getTrimmedCredentials(formData);
  const supabase = await createServerSupabaseClient();
  const result = await authenticateWithPassword(supabase, credentials);

  if (!result.success) {
    return result;
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  redirect('/login');
}
