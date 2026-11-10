// lib/exhibitor-access.test.ts
import { describe, expect, it, vi } from 'vitest';
import {
  ACCESS_CODE_ALPHABET,
  ACCESS_CODE_LENGTH,
  authenticateExhibitor,
  ExhibitorAccessError,
  generateAccessCode,
  hashAccessCode,
  isValidExhibitorEmail,
  normalizeAccessCode,
  normalizeExhibitorEmail,
  registerExhibitor,
  reissueExhibitorPassword,
  requestExhibitorPasswordReset,
  verifyAccessCode,
  type ExhibitorAccessDeps,
  type StoredExhibitorAccess,
} from './exhibitor-access';

const EVENT_ID = 'event-1';
const EMAIL = 'exhibitor@example.com';

interface FakeRecord extends StoredExhibitorAccess {
  lang: string;
}

function fakeDeps(seed: FakeRecord[] = []) {
  const records = new Map<string, FakeRecord>();
  for (const record of seed) records.set(record.id, { ...record });
  let nextId = seed.length + 1;
  const sent: Array<{ to: string; subject: string; html: string }> = [];

  const store: ExhibitorAccessDeps['store'] = {
    findByEmail: vi.fn(async (_eventId: string, email: string) => {
      for (const record of records.values()) {
        if (record.email === email) return { ...record };
      }
      return null;
    }),
    getById: vi.fn(async (_eventId: string, exhibitorId: string) => {
      const record = records.get(exhibitorId);
      return record ? { ...record } : null;
    }),
    createExhibitor: vi.fn(
      async (
        _eventId: string,
        input: { name: string; email: string; lang: 'ja' },
      ) => {
        const id = `exhibitor-${nextId++}`;
        records.set(id, {
          id,
          name: input.name,
          email: input.email,
          accessCodeHash: null,
          lang: input.lang,
        });
        return { id };
      },
    ),
    setAccessCodeHash: vi.fn(
      async (_eventId: string, exhibitorId: string, encodedHash: string) => {
        const record = records.get(exhibitorId);
        if (record) record.accessCodeHash = encodedHash;
      },
    ),
    setEmail: vi.fn(
      async (_eventId: string, exhibitorId: string, email: string) => {
        const record = records.get(exhibitorId);
        if (record) record.email = email;
      },
    ),
  };
  const sendMail = vi.fn(
    async (args: { to: string; subject: string; html: string }) => {
      sent.push(args);
      return { success: true };
    },
  );
  return { deps: { store, sendMail } as ExhibitorAccessDeps, records, sent, store, sendMail };
}

/** メール本文から発行されたコードを取り出す（テスト専用）。 */
function codeFromMail(html: string): string {
  const match = html.match(/<strong>([A-Z0-9]+)<\/strong>/);
  if (!match) throw new Error('mail does not contain a code');
  return match[1];
}

describe('generateAccessCode', () => {
  it('指定の長さで、読み間違えやすい文字を含まない', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateAccessCode();
      expect(code).toHaveLength(ACCESS_CODE_LENGTH);
      for (const ch of code) {
        expect(ACCESS_CODE_ALPHABET).toContain(ch);
      }
      expect(code).not.toMatch(/[01OIL]/);
    }
  });

  it('呼び出しごとに異なるコードになる', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateAccessCode()));
    expect(codes.size).toBe(20);
  });
});

describe('hashAccessCode / verifyAccessCode', () => {
  it('正しいコードだけ通る', async () => {
    const code = generateAccessCode();
    const stored = await hashAccessCode(code);
    await expect(verifyAccessCode(code, stored)).resolves.toBe(true);
    await expect(verifyAccessCode('ZZZZZZZZZZ', stored)).resolves.toBe(false);
  });

  it('同じコードでも salt でハッシュが変わり、どちらも照合できる', async () => {
    const code = generateAccessCode();
    const a = await hashAccessCode(code);
    const b = await hashAccessCode(code);
    expect(a).not.toBe(b);
    await expect(verifyAccessCode(code, a)).resolves.toBe(true);
    await expect(verifyAccessCode(code, b)).resolves.toBe(true);
  });

  it('保存値が無い・壊れている場合は false', async () => {
    await expect(verifyAccessCode('ABCDEFGHJK', null)).resolves.toBe(false);
    await expect(verifyAccessCode('ABCDEFGHJK', undefined)).resolves.toBe(false);
    await expect(verifyAccessCode('ABCDEFGHJK', 'not-a-hash')).resolves.toBe(false);
    await expect(verifyAccessCode('ABCDEFGHJK', 'scrypt$x$y$z')).resolves.toBe(false);
  });

  it('平文は保存されない（エンコード形式で持つ）', async () => {
    const code = generateAccessCode();
    const stored = await hashAccessCode(code);
    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(stored).not.toContain(code);
  });
});

describe('メールアドレスの正規化と検証', () => {
  it('前後空白と大文字を正規化する', () => {
    expect(normalizeExhibitorEmail('  Foo@Example.COM ')).toBe('foo@example.com');
  });

  it('形式検証', () => {
    expect(isValidExhibitorEmail('a@example.com')).toBe(true);
    expect(isValidExhibitorEmail('a@example')).toBe(false);
    expect(isValidExhibitorEmail('a b@example.com')).toBe(false);
    expect(isValidExhibitorEmail('@example.com')).toBe(false);
    expect(isValidExhibitorEmail('')).toBe(false);
  });

  it('コード入力は大文字化して照合する', () => {
    expect(normalizeAccessCode(' abcd2345 ')).toBe('ABCD2345');
  });
});

describe('registerExhibitor', () => {
  it('登録するとコードが発行され、メールで送られ、ハッシュで保存される', async () => {
    const { deps, records, sent } = fakeDeps();
    const result = await registerExhibitor(
      { eventId: EVENT_ID, name: 'テスト出店者', email: '  Exhibitor@Example.com ' },
      deps,
    );
    expect(result.email).toBe(EMAIL);
    expect(result.mailSent).toBe(true);
    expect(result).not.toHaveProperty('code');

    const record = records.get(result.exhibitorId);
    expect(record?.email).toBe(EMAIL);
    expect(record?.accessCodeHash).toMatch(/^scrypt\$/);

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe(EMAIL);
    const code = codeFromMail(sent[0].html);
    await expect(verifyAccessCode(code, record!.accessCodeHash)).resolves.toBe(true);
  });

  it('同一イベント内で同じメールは重複登録できない（大文字小文字を問わない）', async () => {
    const { deps, sent } = fakeDeps();
    await registerExhibitor(
      { eventId: EVENT_ID, name: 'テスト出店者', email: EMAIL },
      deps,
    );
    await expect(
      registerExhibitor(
        { eventId: EVENT_ID, name: '別の名前', email: 'EXHIBITOR@EXAMPLE.COM' },
        deps,
      ),
    ).rejects.toMatchObject({ status: 400 });
    expect(sent).toHaveLength(1);
  });

  it('メール形式が不正なら 400 で、作成も送信もしない', async () => {
    const { deps, store, sendMail } = fakeDeps();
    await expect(
      registerExhibitor(
        { eventId: EVENT_ID, name: 'テスト出店者', email: 'not-an-email' },
        deps,
      ),
    ).rejects.toBeInstanceOf(ExhibitorAccessError);
    expect(store.createExhibitor).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('メールが空なら 400', async () => {
    const { deps } = fakeDeps();
    await expect(
      registerExhibitor({ eventId: EVENT_ID, name: 'テスト出店者', email: ' ' }, deps),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('メール送信に失敗しても登録は成立し、mailSent=false で返る', async () => {
    const { deps, records } = fakeDeps();
    deps.sendMail = vi.fn(async () => ({ success: false, error: 'smtp down' }));
    const result = await registerExhibitor(
      { eventId: EVENT_ID, name: 'テスト出店者', email: EMAIL },
      deps,
    );
    expect(result.mailSent).toBe(false);
    expect(records.get(result.exhibitorId)?.accessCodeHash).toMatch(/^scrypt\$/);
  });
});

describe('authenticateExhibitor', () => {
  it('発行されたコードでログインできる（小文字入力も可）', async () => {
    const { deps, sent } = fakeDeps();
    const result = await registerExhibitor(
      { eventId: EVENT_ID, name: 'テスト出店者', email: EMAIL },
      deps,
    );
    const code = codeFromMail(sent[0].html);
    const authed = await authenticateExhibitor(
      { eventId: EVENT_ID, email: EMAIL, code: code.toLowerCase() },
      deps,
    );
    expect(authed?.exhibitorId).toBe(result.exhibitorId);
  });

  it('間違ったコード・未登録メール・コード未発行では null', async () => {
    const { deps } = fakeDeps([
      {
        id: 'exhibitor-legacy',
        name: '旧出店者',
        email: 'legacy@example.com',
        accessCodeHash: null,
        lang: 'ja',
      },
    ]);
    await registerExhibitor(
      { eventId: EVENT_ID, name: 'テスト出店者', email: EMAIL },
      deps,
    );
    await expect(
      authenticateExhibitor({ eventId: EVENT_ID, email: EMAIL, code: 'ZZZZZZZZZZ' }, deps),
    ).resolves.toBeNull();
    await expect(
      authenticateExhibitor(
        { eventId: EVENT_ID, email: 'nobody@example.com', code: 'ABCDEFGHJK' },
        deps,
      ),
    ).resolves.toBeNull();
    await expect(
      authenticateExhibitor(
        { eventId: EVENT_ID, email: 'legacy@example.com', code: 'ABCDEFGHJK' },
        deps,
      ),
    ).resolves.toBeNull();
  });
});

describe('reissueExhibitorPassword', () => {
  it('再発行すると旧コードが失効し、新コードがメールで届く', async () => {
    const { deps, sent } = fakeDeps();
    const registered = await registerExhibitor(
      { eventId: EVENT_ID, name: 'テスト出店者', email: EMAIL },
      deps,
    );
    const oldCode = codeFromMail(sent[0].html);

    const result = await reissueExhibitorPassword(
      { eventId: EVENT_ID, exhibitorId: registered.exhibitorId },
      deps,
    );
    expect(result.email).toBe(EMAIL);
    expect(sent).toHaveLength(2);
    const newCode = codeFromMail(sent[1].html);
    expect(newCode).not.toBe(oldCode);
    await expect(
      authenticateExhibitor({ eventId: EVENT_ID, email: EMAIL, code: oldCode }, deps),
    ).resolves.toBeNull();
    await expect(
      authenticateExhibitor({ eventId: EVENT_ID, email: EMAIL, code: newCode }, deps),
    ).resolves.toMatchObject({ exhibitorId: registered.exhibitorId });
  });

  it('メール未登録の旧出店者は、メールを設定して発行できる', async () => {
    const { deps, sent } = fakeDeps([
      {
        id: 'exhibitor-legacy',
        name: '旧出店者',
        email: null,
        accessCodeHash: null,
        lang: 'ja',
      },
    ]);
    const result = await reissueExhibitorPassword(
      { eventId: EVENT_ID, exhibitorId: 'exhibitor-legacy', email: 'legacy@example.com' },
      deps,
    );
    expect(result.email).toBe('legacy@example.com');
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('legacy@example.com');
  });

  it('メール未登録でメールも渡されなければ 400', async () => {
    const { deps } = fakeDeps([
      {
        id: 'exhibitor-legacy',
        name: '旧出店者',
        email: null,
        accessCodeHash: null,
        lang: 'ja',
      },
    ]);
    await expect(
      reissueExhibitorPassword({ eventId: EVENT_ID, exhibitorId: 'exhibitor-legacy' }, deps),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('存在しない出店者は 404', async () => {
    const { deps } = fakeDeps();
    await expect(
      reissueExhibitorPassword({ eventId: EVENT_ID, exhibitorId: 'nope' }, deps),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('requestExhibitorPasswordReset', () => {
  it('登録済みメールなら再発行して送る', async () => {
    const { deps, sent } = fakeDeps();
    await registerExhibitor(
      { eventId: EVENT_ID, name: 'テスト出店者', email: EMAIL },
      deps,
    );
    await requestExhibitorPasswordReset({ eventId: EVENT_ID, email: EMAIL }, deps);
    expect(sent).toHaveLength(2);
  });

  it('未登録メール・不正な形式でも例外なく終わり、メールは送らない', async () => {
    const { deps, sent } = fakeDeps();
    await expect(
      requestExhibitorPasswordReset({ eventId: EVENT_ID, email: 'nobody@example.com' }, deps),
    ).resolves.toBeUndefined();
    await expect(
      requestExhibitorPasswordReset({ eventId: EVENT_ID, email: 'broken' }, deps),
    ).resolves.toBeUndefined();
    expect(sent).toHaveLength(0);
  });
});
