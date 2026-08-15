export type LoginFormState = {
  success: boolean;
  error: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
  };
};

export const INITIAL_LOGIN_STATE: LoginFormState = {
  success: false,
  error: null,
  fieldErrors: {}
};

export type LoginCredentials = {
  email: string;
  password: string;
};

type PasswordSignInClient = {
  auth: {
    signInWithPassword(credentials: LoginCredentials): Promise<{
      error: { message: string } | null;
    }>;
  };
};

export function validateLoginCredentials(credentials: LoginCredentials): LoginFormState {
  const fieldErrors: LoginFormState['fieldErrors'] = {};

  if (!credentials.email || !credentials.email.includes('@')) {
    fieldErrors.email = 'Введіть коректний email.';
  }

  if (!credentials.password || credentials.password.length < 8) {
    fieldErrors.password = 'Пароль має містити щонайменше 8 символів.';
  }

  return {
    success: false,
    error: null,
    fieldErrors
  };
}

export async function authenticateWithPassword(
  client: PasswordSignInClient,
  credentials: LoginCredentials
): Promise<LoginFormState> {
  const validation = validateLoginCredentials(credentials);

  if (Object.keys(validation.fieldErrors).length > 0) {
    return validation;
  }

  const { error } = await client.auth.signInWithPassword(credentials);

  if (error) {
    return {
      success: false,
      error: 'Не вдалося увійти. Перевірте email, пароль і membership доступ.',
      fieldErrors: {}
    };
  }

  return {
    success: true,
    error: null,
    fieldErrors: {}
  };
}
