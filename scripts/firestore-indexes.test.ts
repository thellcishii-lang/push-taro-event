import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const { syncIndexes } = require('./firestore-indexes.cjs');
const { indexes } = require('../firestore.indexes.json');

function response(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe('add-only Firestore index deployment', () => {
  it('checks missing indexes without writes by default', async () => {
    const fetchImpl = vi.fn().mockImplementation(async () => response({}));
    const result = await syncIndexes({ projectId: 'test-project', token: 'test-token', fetchImpl });
    expect(result.map(({ state }: { state: string }) => state)).toEqual(['MISSING', 'MISSING']);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls.every(([, options]) => !options.method)).toBe(true);
  });

  it('creates only missing indexes and never deletes unrelated live indexes', async () => {
    const fetchImpl = vi.fn().mockImplementation(async (_url, options) => {
      if (options.method === 'POST') return response({ name: 'operation' });
      return response({ indexes: [{ queryScope: 'COLLECTION', fields: [{ fieldPath: 'other', order: 'ASCENDING' }], state: 'READY' }] });
    });
    const result = await syncIndexes({ projectId: 'test-project', token: 'test-token', apply: true, fetchImpl });
    expect(result.every(({ state }: { state: string }) => state === 'CREATION_REQUESTED')).toBe(true);
    const writes = fetchImpl.mock.calls.filter(([, options]) => options.method);
    expect(writes).toHaveLength(2);
    for (const [, options] of writes) {
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toMatchObject({ queryScope: 'COLLECTION' });
      expect(JSON.parse(options.body)).not.toHaveProperty('collectionGroup');
    }
  });

  it('recognizes existing definitions across pages, including the implicit document ID field', async () => {
    const fetchImpl = vi.fn().mockImplementation(async (url: URL) => {
      const definition = indexes.find((index: { collectionGroup: string }) => url.pathname.includes(index.collectionGroup));
      if (!url.searchParams.has('pageToken')) return response({ nextPageToken: 'next' });
      return response({ indexes: [{
        ...definition, fields: [...definition.fields, { fieldPath: '__name__', order: 'ASCENDING' }], state: 'READY',
      }] });
    });
    const result = await syncIndexes({ projectId: 'test-project', token: 'test-token', apply: true, fetchImpl });
    expect(result.every(({ state }: { state: string }) => state === 'READY')).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(fetchImpl.mock.calls.every(([, options]) => !options.method)).toBe(true);
  });

  it('does not recreate an index still being built', async () => {
    const fetchImpl = vi.fn().mockImplementation(async (url: URL) => response({
      indexes: indexes.filter((index: { collectionGroup: string }) => url.pathname.includes(index.collectionGroup))
        .map((index: object) => ({ ...index, state: 'CREATING' })),
    }));
    const result = await syncIndexes({ projectId: 'test-project', token: 'test-token', apply: true, fetchImpl });
    expect(result.every(({ state }: { state: string }) => state === 'CREATING')).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('surfaces permission errors without attempting writes', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({}, 403));
    await expect(syncIndexes({ projectId: 'test-project', token: 'test-token', apply: true, fetchImpl }))
      .rejects.toThrow('HTTP 403');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
