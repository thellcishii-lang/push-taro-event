// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PosIntegrationSection from './PosIntegrationSection';

describe('POS integration management', () => {
  let root: Root;
  let container: HTMLDivElement;
  const fetchMock = vi.fn();
  const user = { getIdToken: vi.fn(async () => 'owner-id-token') };
  let hasKey = false;
  const plainKey = 'pt_live_test-key';

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.clear();
    hasKey = false;
    fetchMock.mockReset().mockImplementation(async (_url: string, init: RequestInit) => {
      if (init.method === 'POST') {
        hasKey = true;
        return Response.json({ success: true, key: plainKey, message: '発行しました' });
      }
      if (init.method === 'DELETE') {
        hasKey = false;
        return Response.json({ success: true, message: '失効しました' });
      }
      return Response.json({ success: true, hasKey, keyPrefix: hasKey ? 'pt_live_test' : null, createdAt: null, lastUsedAt: null, revokedAt: null });
    });
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  const button = (label: string) => [...container.querySelectorAll('button')].find((item) => item.textContent === label)!;
  const render = async () => act(async () => root.render(<PosIntegrationSection shopId="shop" user={user} />));

  it('issues, confirms rotation, and revokes the selected shop key without browser persistence', async () => {
    await render();
    expect(fetchMock).toHaveBeenCalledWith('/api/pro-shop/pos-api-key?shopId=shop', expect.objectContaining({
      headers: { Authorization: 'Bearer owner-id-token' },
    }));
    await act(async () => button('APIキーを発行').click());
    expect(container.querySelector('input')?.value).toBe(plainKey);
    expect(localStorage.length).toBe(0);
    await act(async () => button('APIキーを再発行').click());
    expect(window.confirm).toHaveBeenCalled();
    await act(async () => button('APIキーを失効').click());
    expect(container.querySelector('input')).toBeNull();
    expect(button('APIキーを失効').disabled).toBe(true);
  });

  it('does not revoke after cancelling confirmation', async () => {
    hasKey = true;
    await render();
    vi.mocked(window.confirm).mockReturnValue(false);
    await act(async () => button('APIキーを失効').click());
    expect(fetchMock.mock.calls.some(([, init]) => init.method === 'DELETE')).toBe(false);
  });

  it('surfaces loading errors and allows retry', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ error: '認証期限切れ' }, { status: 401 }));
    await render();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('認証期限切れ');
    expect(button('APIキーを発行').disabled).toBe(true);
    await act(async () => button('状態を更新').click());
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(button('APIキーを発行').disabled).toBe(false);
  });
});
