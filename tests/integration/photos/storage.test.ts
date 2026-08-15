import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
// @ts-expect-error JS helper without declaration file is intentional for integration tests.
import { createTestDb } from '../../helpers/postgres.js';
// @ts-expect-error JS helper without declaration file is intentional for integration tests.
import { listStorageObjectNames } from '../../helpers/storage.js';
import { createServiceRoleSupabaseClient } from '../../helpers/supabase';
import {
  buildCoinPhotoPath,
  removeCoinPhotoPath,
  uploadCoinPhotoBuffer
} from '@/features/coins/photos/server/storage';

describe('photo storage helpers', () => {
  const db = createTestDb();
  const supabase = createServiceRoleSupabaseClient();

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.end();
  });

  it('uploads and removes photo objects in the private storage bucket', async () => {
    const coinId = randomUUID();
    const path = buildCoinPhotoPath(coinId, 'obverse');
    const buffer = await sharp({
      create: {
        width: 48,
        height: 48,
        channels: 3,
        background: '#8093f1'
      }
    })
      .webp()
      .toBuffer();

    const beforeNames = await listStorageObjectNames(db, 'coin-photos');
    expect(beforeNames).not.toContain(path);

    const uploadedPath = await uploadCoinPhotoBuffer(supabase, coinId, 'obverse', buffer);
    expect(uploadedPath).toBe(path);

    const afterUploadNames = await listStorageObjectNames(db, 'coin-photos');
    expect(afterUploadNames).toContain(path);

    await removeCoinPhotoPath(supabase, path);

    const afterRemoveNames = await listStorageObjectNames(db, 'coin-photos');
    expect(afterRemoveNames).not.toContain(path);
  });
});
