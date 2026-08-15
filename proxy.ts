import { NextResponse, type NextRequest } from 'next/server';
import {
  getAccessRedirectPath,
  getPathnameFromRequest,
  resolveAuthAccessStateFromSupabase
} from '@/shared/auth/access';
import { createProxySupabaseClient } from '@/shared/supabase/proxy';

export async function proxy(request: NextRequest) {
  const pathname = getPathnameFromRequest(request);
  const { supabase, getResponse } = await createProxySupabaseClient(request);
  const access = await resolveAuthAccessStateFromSupabase(supabase);
  const sessionResponse = getResponse();
  const redirectPath = getAccessRedirectPath(pathname, access);

  if (!redirectPath) {
    return sessionResponse;
  }

  const redirectUrl = new URL(redirectPath, request.url);
  const response = NextResponse.redirect(redirectUrl);

  sessionResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  response.headers.set('Cache-Control', 'private, no-store');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
