import { describe, expect, it } from 'vitest';
import { assertPublicPhotoImportUrl } from '@/features/coins/photos/server/security';

describe('photo import URL validation', () => {
  it('accepts only http/https public-looking URLs', () => {
    expect(assertPublicPhotoImportUrl('https://example.com/photo.jpg').hostname).toBe('example.com');
    expect(assertPublicPhotoImportUrl('http://cdn.example.com/image.png').protocol).toBe('http:');
  });

  it('rejects localhost and non-http protocols', () => {
    expect(() => assertPublicPhotoImportUrl('file:///tmp/a.png')).toThrow(
      'Дозволені лише http/https URL для імпорту фото.'
    );
    expect(() => assertPublicPhotoImportUrl('https://localhost/photo.jpg')).toThrow(
      'Імпорт із localhost заборонений.'
    );
  });
});
