import { describe, expect, it } from 'vitest';
import { DEFAULT_STORAGE_BUCKET, resolveStorageBucket } from './storage-bucket';

describe('resolveStorageBucket', () => {
  it('prefers FIREBASE_STORAGE_BUCKET', () => {
    expect(
      resolveStorageBucket({
        FIREBASE_STORAGE_BUCKET: 'server-bucket',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'public-bucket',
      }),
    ).toBe('server-bucket');
  });

  it('falls back to NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', () => {
    expect(
      resolveStorageBucket({
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'public-bucket',
      }),
    ).toBe('public-bucket');
  });

  it('treats empty strings as unset', () => {
    expect(
      resolveStorageBucket({
        FIREBASE_STORAGE_BUCKET: '',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'public-bucket',
      }),
    ).toBe('public-bucket');
  });

  it('falls back to the project default bucket', () => {
    expect(resolveStorageBucket({})).toBe(DEFAULT_STORAGE_BUCKET);
    expect(DEFAULT_STORAGE_BUCKET).toBe('push-taro-event.firebasestorage.app');
  });
});
