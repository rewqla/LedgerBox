import { describe, expect, it } from 'vitest';
import {
  buildLoginRedirect,
  getAccessRedirectPath,
  type AuthAccessState
} from '@/shared/auth/policy';

describe('auth access redirects', () => {
  const anonymous: AuthAccessState = { kind: 'anonymous' };
  const noMembership: AuthAccessState = {
    kind: 'authenticated-no-membership',
    userId: 'user-1',
    email: 'blocked@example.com'
  };
  const member: AuthAccessState = {
    kind: 'member',
    userId: 'user-2',
    email: 'member@example.com',
    fullName: 'Member'
  };

  it('redirects anonymous users to login with the original path preserved', () => {
    expect(buildLoginRedirect('/dashboard')).toBe('/login?next=%2Fdashboard');
    expect(getAccessRedirectPath('/dashboard', anonymous)).toBe('/login?next=%2Fdashboard');
  });

  it('allows anonymous users to stay on auth routes', () => {
    expect(getAccessRedirectPath('/login', anonymous)).toBeNull();
    expect(getAccessRedirectPath('/forbidden', anonymous)).toBeNull();
  });

  it('redirects authenticated users without membership to forbidden', () => {
    expect(getAccessRedirectPath('/dashboard', noMembership)).toBe('/forbidden');
    expect(getAccessRedirectPath('/forbidden', noMembership)).toBeNull();
  });

  it('redirects active members away from auth routes into the app', () => {
    expect(getAccessRedirectPath('/login', member)).toBe('/dashboard');
    expect(getAccessRedirectPath('/forbidden', member)).toBe('/dashboard');
    expect(getAccessRedirectPath('/dashboard', member)).toBeNull();
  });
});
