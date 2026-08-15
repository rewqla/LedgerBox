import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { randomBytes } from 'node:crypto';
import {
  MAX_PHOTO_SIZE_BYTES
} from '@/features/coins/photos/server/constants';
import { processImageBufferToWebp } from '@/features/coins/photos/server/processing';

describe('photo processing pipeline', () => {
  it('compresses processed images to WebP <= 1 MB', async () => {
    const width = 1800;
    const height = 1800;
    const raw = randomBytes(width * height * 3);
    const input = await sharp(raw, {
      raw: {
        width,
        height,
        channels: 3
      }
    })
      .png()
      .toBuffer();

    const output = await processImageBufferToWebp(input);

    expect(output.byteLength).toBeLessThanOrEqual(MAX_PHOTO_SIZE_BYTES);
    expect(output.subarray(0, 4).toString()).toBe('RIFF');
  });

  it('rejects invalid image buffers', async () => {
    await expect(processImageBufferToWebp(Buffer.from('not-an-image'))).rejects.toThrow();
  });
});
