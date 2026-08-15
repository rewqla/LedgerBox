export type AuthAccessState =
  | {
      kind: 'anonymous';
    }
  | {
      kind: 'authenticated-no-membership';
      userId: string;
      email: string | null;
    }
  | {
      kind: 'member';
      userId: string;
      email: string | null;
      fullName: string | null;
    };

export const AUTH_ROUTES = new Set(['/login', '/forbidden']);

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname);
}

export function buildLoginRedirect(pathname: string): string {
  const params = new URLSearchParams({
    next: pathname
  });

  return `/login?${params.toString()}`;
}

export function getAccessRedirectPath(
  pathname: string,
  state: AuthAccessState
): string | null {
  const authRoute = isAuthRoute(pathname);

  if (state.kind === 'anonymous') {
    return authRoute ? null : buildLoginRedirect(pathname);
  }

  if (state.kind === 'authenticated-no-membership') {
    return pathname === '/forbidden' ? null : '/forbidden';
  }

  if (authRoute) {
    return '/dashboard';
  }

  return null;
}
