import type { SupabaseClient } from '@supabase/supabase-js';
import {
  COIN_PHOTO_BUCKET,
  MAX_PHOTO_SIZE_BYTES,
  type CoinPhotoSlot
} from '@/features/coins/photos/server/constants';

export function buildCoinPhotoPath(
  coinId: string,
  slot: CoinPhotoSlot
): string {
  return `${coinId}/${slot}.webp`;
}

export async function uploadCoinPhotoBuffer(
  supabase: SupabaseClient,
  coinId: string,
  slot: CoinPhotoSlot,
  buffer: Buffer
): Promise<string> {
  if (buffer.byteLength > MAX_PHOTO_SIZE_BYTES) {
    throw new Error('Кінцевий файл фото перевищує 1 MB.');
  }

  const path = buildCoinPhotoPath(coinId, slot);
  const removeResult = await supabase.storage.from(COIN_PHOTO_BUCKET).remove([path]);

  if (removeResult.error && !removeResult.error.message.includes('Object not found')) {
    throw new Error(`Failed to remove existing photo before upload: ${removeResult.error.message}`);
  }

  const { error } = await supabase.storage
    .from(COIN_PHOTO_BUCKET)
    .upload(path, buffer, {
      cacheControl: '3600',
      contentType: 'image/webp',
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload coin photo: ${error.message}`);
  }

  return path;
}

export async function removeCoinPhotoPath(
  supabase: SupabaseClient,
  path: string | null
) {
  if (!path) {
    return;
  }

  const { error } = await supabase.storage.from(COIN_PHOTO_BUCKET).remove([path]);

  if (error && !error.message.includes('Object not found')) {
    throw new Error(`Failed to remove coin photo: ${error.message}`);
  }
}
