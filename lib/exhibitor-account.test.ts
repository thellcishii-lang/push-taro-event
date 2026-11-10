// lib/exhibitor-account.test.ts
import { describe, expect, it, vi } from 'vitest';
import {
  buildExhibitorInviteEmail,
  ExhibitorAccountError,
  resolveOrCreateExhibitorAccount,
  type ExhibitorAccountDeps,
} from './exhibitor-account';

const EMAIL = 'exhibitor@example.com';
const SETUP_LINK = 'https://example.com/reset?oobCode=abc123';

function authError(code: string): Error {
  return Object.assign(new Error(code), { code });
}

function fakeDeps(
  overrides: Partial<{
    getUserByEmail: ExhibitorAccountDeps['auth']['getUserByEmail'];
    createUser: ExhibitorAccountDeps['auth']['createUser'];
    generatePasswordResetLink: ExhibitorAccountDeps['auth']['generatePasswordResetLink'];
    sendMail: ExhibitorAccountDeps['sendMail'];
  }> = {},
): ExhibitorAccountDeps & {
  auth: {
    getUserByEmail: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    generatePasswordResetLink: ReturnType<typeof vi.fn>;
  };
  sendMail: ReturnType<typeof vi.fn>;
} {
  const auth = {
    getUserByEmail: vi.fn(
      overrides.getUserByEmail ??
        (async () => {
          throw authError('auth/user-not-found');
        }),
    ),
    createUser: vi.fn(
      overrides.createUser ?? (async () => ({ uid: 'uid-new' })),
    ),
    generatePasswordResetLink: vi.fn(
      overrides.generatePasswordResetLink ?? (async () => SETUP_LINK),
    ),
  };
  const sendMail = vi.fn(
    overrides.sendMail ?? (async () => ({ success: true })),
  );
  return { auth, sendMail };
}

describe('resolveOrCreateExhibitorAccount', () => {
  it('既存アカウントがあれば連携のみで、作成もメール送信もしない', async () => {
    const deps = fakeDeps({
      getUserByEmail: async () => ({ uid: 'uid-existing' }),
    });
    const result = await resolveOrCreateExhibitorAccount(
      EMAIL,
      { exhibitorName: 'テスト出店者' },
      deps,
    );
    expect(result).toEqual({
      authUid: 'uid-existing',
      accountCreated: false,
      inviteSent: false,
    });
    expect(deps.auth.createUser).not.toHaveBeenCalled();
    expect(deps.sendMail).not.toHaveBeenCalled();
  });

  it('アカウントが無ければ自動作成し、招待メールに設定リンクを入れて送る', async () => {
    const deps = fakeDeps();
    const result = await resolveOrCreateExhibitorAccount(
      EMAIL,
      { exhibitorName: 'テスト出店者', eventName: 'テスト展示会' },
      deps,
    );
    expect(result).toEqual({
      authUid: 'uid-new',
      accountCreated: true,
      inviteSent: true,
    });
    expect(deps.auth.createUser).toHaveBeenCalledTimes(1);
    // 作成リクエストにはメールアドレスと十分な長さの一時資格情報が入る
    const request = deps.auth.createUser.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(request.email).toBe(EMAIL);
    const credential = Object.values(request).find(
      (v): v is string => typeof v === 'string' && v !== EMAIL,
    );
    expect(credential).toBeDefined();
    expect(credential!.length).toBeGreaterThanOrEqual(16);
    // 招待メール: 宛先・件名・設定リンク。一時資格情報は含めない
    expect(deps.sendMail).toHaveBeenCalledTimes(1);
    const mail = deps.sendMail.mock.calls[0][0] as {
      to: string;
      subject: string;
      html: string;
    };
    expect(mail.to).toBe(EMAIL);
    expect(mail.subject).toContain('パスワード設定');
    expect(mail.html).toContain(SETUP_LINK);
    expect(mail.html).toContain('テスト展示会');
    expect(mail.html).not.toContain(credential!);
  });

  it('招待メールの送信に失敗しても登録自体は成功する', async () => {
    const deps = fakeDeps({
      sendMail: async () => ({ success: false, error: 'smtp error' }),
    });
    const result = await resolveOrCreateExhibitorAccount(
      EMAIL,
      { exhibitorName: 'テスト出店者' },
      deps,
    );
    expect(result.accountCreated).toBe(true);
    expect(result.inviteSent).toBe(false);
  });

  it('設定リンクの生成に失敗しても登録自体は成功する', async () => {
    const deps = fakeDeps({
      generatePasswordResetLink: async () => {
        throw new Error('link failed');
      },
    });
    const result = await resolveOrCreateExhibitorAccount(
      EMAIL,
      { exhibitorName: 'テスト出店者' },
      deps,
    );
    expect(result.accountCreated).toBe(true);
    expect(result.inviteSent).toBe(false);
    expect(deps.sendMail).not.toHaveBeenCalled();
  });

  it('user-not-found 以外の照会エラーは 500 で投げ、作成しない', async () => {
    const deps = fakeDeps({
      getUserByEmail: async () => {
        throw authError('auth/internal-error');
      },
    });
    await expect(
      resolveOrCreateExhibitorAccount(
        EMAIL,
        { exhibitorName: 'テスト出店者' },
        deps,
      ),
    ).rejects.toMatchObject({ status: 500 });
    await expect(
      resolveOrCreateExhibitorAccount(
        EMAIL,
        { exhibitorName: 'テスト出店者' },
        deps,
      ),
    ).rejects.toBeInstanceOf(ExhibitorAccountError);
    expect(deps.auth.createUser).not.toHaveBeenCalled();
  });

  it('メール形式が不正なら 400 で投げる', async () => {
    const deps = fakeDeps({
      createUser: async () => {
        throw authError('auth/invalid-email');
      },
    });
    await expect(
      resolveOrCreateExhibitorAccount(
        'not-an-email',
        { exhibitorName: 'テスト出店者' },
        deps,
      ),
    ).rejects.toMatchObject({
      status: 400,
      message: 'メールアドレスの形式が正しくありません',
    });
  });

  it('作成が競合したら既存アカウントへの連携に切り替える', async () => {
    let lookups = 0;
    const deps = fakeDeps({
      getUserByEmail: async () => {
        lookups += 1;
        if (lookups === 1) throw authError('auth/user-not-found');
        return { uid: 'uid-raced' };
      },
      createUser: async () => {
        throw authError('auth/email-already-exists');
      },
    });
    const result = await resolveOrCreateExhibitorAccount(
      EMAIL,
      { exhibitorName: 'テスト出店者' },
      deps,
    );
    expect(result).toEqual({
      authUid: 'uid-raced',
      accountCreated: false,
      inviteSent: false,
    });
    expect(deps.sendMail).not.toHaveBeenCalled();
  });
});

describe('buildExhibitorInviteEmail', () => {
  it('イベント名がある場合は本文に入る', () => {
    const mail = buildExhibitorInviteEmail({
      exhibitorName: '山田商店',
      eventName: '春の展示会',
      setupLink: SETUP_LINK,
    });
    expect(mail.html).toContain('山田商店');
    expect(mail.html).toContain('春の展示会');
    expect(mail.html).toContain(SETUP_LINK);
  });

  it('イベント名が無い場合は汎用の文面になる', () => {
    const mail = buildExhibitorInviteEmail({
      exhibitorName: '山田商店',
      setupLink: SETUP_LINK,
    });
    expect(mail.html).toContain('Push-taro EVENT の出店者として');
    expect(mail.html).toContain(SETUP_LINK);
  });

  it('出店者名・イベント名の HTML 特殊文字はエスケープされる', () => {
    const mail = buildExhibitorInviteEmail({
      exhibitorName: '<b>悪意</b>',
      eventName: 'A&B',
      setupLink: SETUP_LINK,
    });
    expect(mail.html).not.toContain('<b>悪意</b>');
    expect(mail.html).toContain('A&amp;B');
  });
});
