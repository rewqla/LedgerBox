import sharp from 'sharp';
import {
  MAX_PHOTO_LONG_SIDE,
  MAX_PHOTO_SIZE_BYTES,
  MIN_PHOTO_LONG_SIDE
} from '@/features/coins/photos/server/constants';

export async function processImageBufferToWebp(
  input: Buffer
): Promise<Buffer> {
  let dimension = MAX_PHOTO_LONG_SIDE;
  let quality = 82;

  while (dimension >= MIN_PHOTO_LONG_SIDE) {
    const output = await sharp(input)
      .rotate()
      .resize({
        width: dimension,
        height: dimension,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality,
        effort: 5
      })
      .toBuffer();

    if (output.byteLength <= MAX_PHOTO_SIZE_BYTES) {
      return output;
    }

    if (quality > 58) {
      quality -= 8;
    } else {
      dimension -= 160;
      quality = 76;
    }
  }

  throw new Error('Не вдалося стиснути фото до WebP ≤ 1 MB.');
}

export async function normalizeLocalUploadedPhoto(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();

  return processImageBufferToWebp(Buffer.from(arrayBuffer));
}
