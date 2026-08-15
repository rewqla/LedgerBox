import { MAX_REMOTE_DOWNLOAD_BYTES, MAX_REMOTE_REDIRECTS, REMOTE_FETCH_TIMEOUT_MS, type CoinPhotoSlot } from '@/features/coins/photos/server/constants';
import { processImageBufferToWebp } from '@/features/coins/photos/server/processing';
import { assertRemotePhotoUrlIsSafe } from '@/features/coins/photos/server/security';
import { uploadCoinPhotoBuffer } from '@/features/coins/photos/server/storage';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function readResponseWithLimit(response: Response): Promise<Buffer> {
  if (!response.body) {
    throw new Error('Не вдалося отримати тіло відповіді для photo import.');
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    received += value.byteLength;

    if (received > MAX_REMOTE_DOWNLOAD_BYTES) {
      throw new Error('Віддалене фото перевищує дозволений розмір для завантаження.');
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

async function fetchWithRedirectLimit(url: URL): Promise<Response> {
  let current = url;

  for (let redirect = 0; redirect <= MAX_REMOTE_REDIRECTS; redirect += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REMOTE_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'LedgerBox photo import'
        }
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');

        if (!location) {
          throw new Error('Отримано redirect без location для photo import.');
        }

        current = new URL(location, current);
        continue;
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error('Перевищено ліміт redirect під час photo import.');
}

export async function importPhotoFromRemoteUrlAndUpload(args: {
  supabase: SupabaseClient;
  coinId: string;
  slot: CoinPhotoSlot;
  url: string;
}) {
  const safeUrl = await assertRemotePhotoUrlIsSafe(args.url);
  const response = await fetchWithRedirectLimit(safeUrl);

  if (!response.ok) {
    throw new Error(`Віддалений сервер повернув ${response.status} під час photo import.`);
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.startsWith('image/')) {
    throw new Error('Віддалений ресурс не є зображенням.');
  }

  const downloaded = await readResponseWithLimit(response);
  const processed = await processImageBufferToWebp(downloaded);
  const path = await uploadCoinPhotoBuffer(args.supabase, args.coinId, args.slot, processed);

  return {
    path,
    contentType: 'image/webp',
    sizeBytes: processed.byteLength
  };
}
