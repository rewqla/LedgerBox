import { NextResponse } from 'next/server';
import { resolveAuthAccessState } from '@/shared/auth/access';
import { createServerSupabaseClient } from '@/shared/supabase/server';
import { exportCoinsCollection } from '@/features/coins/import-export/server/services';

export async function GET() {
  const access = await resolveAuthAccessState();

  if (access.kind !== 'member') {
    return NextResponse.json(
      {
        error: 'Member access is required.'
      },
      {
        status: 403
      }
    );
  }

  const supabase = await createServerSupabaseClient();
  const payload = await exportCoinsCollection(supabase);
  const body = JSON.stringify(payload, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': 'attachment; filename="ledgerbox-coins-export.json"'
    }
  });
}
