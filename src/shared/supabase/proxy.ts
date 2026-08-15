import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabasePublishableKey, getSupabaseUrl } from './env';

function applyCacheHeaders(
  response: NextResponse,
  cookieHeaders?: Headers
): NextResponse {
  response.headers.set('Cache-Control', 'private, no-store');

  if (!cookieHeaders) {
    return response;
  }

  cookieHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export async function createProxySupabaseClient(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: CookieOptions;
        }>,
        cookieHeaders?: Headers
      ) {
        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        applyCacheHeaders(response, cookieHeaders);
      }
    }
  });

  return {
    supabase,
    getResponse() {
      return applyCacheHeaders(response);
    }
  };
}
