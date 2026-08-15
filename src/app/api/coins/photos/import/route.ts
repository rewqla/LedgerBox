import { NextResponse } from 'next/server';
import { resolveAuthAccessState } from '@/shared/auth/access';
import { createServerSupabaseClient } from '@/shared/supabase/server';
import { importPhotoFromRemoteUrlAndUpload } from '@/features/coins/photos/server/import';
import type { CoinPhotoSlot } from '@/features/coins/photos/server/constants';

function isPhotoSlot(value: string): value is CoinPhotoSlot {
  return value === 'obverse' || value === 'reverse';
}

type ImportBody = {
  coinId?: string;
  slot?: string;
  url?: string;
};

export async function POST(request: Request) {
  const access = await resolveAuthAccessState();

  if (access.kind !== 'member') {
    return NextResponse.json(
      {
        error: 'Forbidden'
      },
      {
        status: 403
      }
    );
  }

  const body = (await request.json()) as ImportBody;

  if (!body.coinId || !body.url || !body.slot || !isPhotoSlot(body.slot)) {
    return NextResponse.json(
      {
        error: 'coinId, slot and url are required.'
      },
      {
        status: 400
      }
    );
  }

  const supabase = await createServerSupabaseClient();

  try {
    const imported = await importPhotoFromRemoteUrlAndUpload({
      supabase,
      coinId: body.coinId,
      slot: body.slot,
      url: body.url
    });

    const fieldName = body.slot === 'obverse' ? 'obverse_photo_path' : 'reverse_photo_path';
    const { error } = await supabase
      .schema('coins')
      .from('coins')
      .update({
        [fieldName]: imported.path
      })
      .eq('id', body.coinId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      path: imported.path,
      sizeBytes: imported.sizeBytes
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Photo import failed.'
      },
      {
        status: 400
      }
    );
  }
}
