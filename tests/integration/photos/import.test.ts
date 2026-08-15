import { describe, expect, it } from 'vitest';
import { MAX_REMOTE_DOWNLOAD_BYTES } from '@/features/coins/photos/server/constants';
import { readResponseWithLimit } from '@/features/coins/photos/server/import';

describe('photo import response limits', () => {
  it('rejects remote payloads that exceed the download limit', async () => {
    const chunk = new Uint8Array(MAX_REMOTE_DOWNLOAD_BYTES + 10);
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(chunk);
        controller.close();
      }
    });

    const response = new Response(body, {
      status: 200,
      headers: {
        'content-type': 'image/png'
      }
    });

    await expect(readResponseWithLimit(response)).rejects.toThrow(
      'Віддалене фото перевищує дозволений розмір для завантаження.'
    );
  });
});
