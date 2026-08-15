import { MAX_PHOTO_LONG_SIDE, MAX_PHOTO_SIZE_BYTES, MIN_PHOTO_LONG_SIDE } from '@/features/coins/photos/server/constants';

async function loadImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function processLocalPhoto(file: File): Promise<File> {
  const image = await loadImage(file);
  let dimension = MAX_PHOTO_LONG_SIDE;
  let quality = 0.84;

  while (dimension >= MIN_PHOTO_LONG_SIDE) {
    const canvas = document.createElement('canvas');
    const ratio = Math.min(1, dimension / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is unavailable for local photo processing.');
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/webp', quality);
    });

    if (!blob) {
      throw new Error('Не вдалося обробити локальне фото.');
    }

    if (blob.size <= MAX_PHOTO_SIZE_BYTES) {
      return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'coin-photo'}.webp`, {
        type: 'image/webp'
      });
    }

    if (quality > 0.58) {
      quality -= 0.08;
    } else {
      dimension -= 160;
      quality = 0.76;
    }
  }

  throw new Error('Не вдалося стиснути локальне фото до WebP ≤ 1 MB.');
}
