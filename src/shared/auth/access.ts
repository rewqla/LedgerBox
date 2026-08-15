import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/shared/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthAccessState } from '@/shared/auth/policy';
export { AUTH_ROUTES, buildLoginRedirect, getAccessRedirectPath, isAuthRoute } from '@/shared/auth/policy';

type ProfileRow = {
  user_id: string;
  email: string;
  full_name: string | null;
};

export async function resolveAuthAccessState(): Promise<AuthAccessState> {
  const supabase = await createServerSupabaseClient();

  return resolveAuthAccessStateFromSupabase(supabase);
}

export async function resolveAuthAccessStateFromSupabase(
  supabase: SupabaseClient
): Promise<AuthAccessState> {
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return {
      kind: 'anonymous'
    };
  }

  const userId = claimsData.claims.sub;
  const emailClaim =
    typeof claimsData.claims.email === 'string' ? claimsData.claims.email : null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, email, full_name')
    .eq('user_id', userId)
    .maybeSingle();

  const profileRow = (profile ?? null) as ProfileRow | null;

  if (!profileRow) {
    return {
      kind: 'authenticated-no-membership',
      userId,
      email: emailClaim
    };
  }

  return {
    kind: 'member',
    userId: profileRow.user_id,
    email: profileRow.email ?? emailClaim,
    fullName: profileRow.full_name
  };
}

export async function requireMemberAccess() {
  const access = await resolveAuthAccessState();

  if (access.kind !== 'member') {
    throw new Error('Member access is required before rendering protected application routes.');
  }

  return access;
}

export function getPathnameFromRequest(request: NextRequest): string {
  return request.nextUrl.pathname;
}
