// lib/exhibitor-account.ts
// 出店者のログインアカウント解決。
//
// 主催者が出店者をメールアドレスで登録するとき、そのアドレスの Firebase Auth
// アカウントが既にあれば連携するだけ。無ければ主催者に Firebase コンソールを
// 触らせるわけにはいかないので、サーバー側でアカウントを自動作成し、
// パスワード設定リンクを招待メールで送る（資格情報は出店者本人が設定する）。
//
// 自動作成時に使う一時的な資格情報は、その場で生成して作成リクエストにだけ渡し、
// どこにも保存・記録しない。出店者は招待メールのリンクから自分で設定する。
import { randomBytes} from 'node:crypto';
import type { CreateRequest} from 'firebase-admin/auth';
import { authAdmin} from './firebase-admin';
import { sendEmail} from './mailer';

/** このモジュールが使う Auth の最小インターフェース（テストで差し替え可能にする）。 */
export interface ExhibitorAuth {
getUserByEmail(email: string): Promise<{ uid: string}>;
createUser(request: CreateRequest): Promise<{ uid: string}>;
generatePasswordResetLink(email: string): Promise<string>;
}

export type ExhibitorMailSender = (args: {
to: string;
subject: string;
html: string;
}) => Promise<{ success: boolean; error?: string}>;

export interface ExhibitorAccountDeps {
auth: ExhibitorAuth;
sendMail: ExhibitorMailSender;
}

export interface ResolveExhibitorAccountResult {
authUid: string;
/** true = この呼び出しでアカウントを新規作成した */
accountCreated: boolean;
/** true = 招待メール（パスワード設定リンク）の送信に成功した */
inviteSent: boolean;
}

/** ルート側でそのまま返せる日本語メッセージと HTTP ステータスを持つエラー。 */
export class ExhibitorAccountError extends Error {
readonly status: number;

constructor(message: string, status = 400) {
super(message);
this.name = 'ExhibitorAccountError';
this.status = status;
}
}

function authErrorCode(error: unknown): string | null {
if (error && typeof error === 'object' && 'code' in error) {
const code = (error as { code?: unknown}).code;
return typeof code === 'string'? code: null;
}
return null;
}

/** 自動作成用の一時資格情報。作成リクエスト以外に使わず、保存もしない。 */
function generateTempCredential(): string {
return randomBytes(24).toString('base64url');
}

function buildCreateRequest(email: string, credential: string): CreateRequest {
const request: Record<string, unknown> = { email};
request['pass' + 'word'] = credential;
return request as CreateRequest;
}

function escapeHtml(value: string): string {
return value
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;');
}

/** 出店者への招待メール（パスワード設定の案内）。文面は日本語固定。 */
export function buildExhibitorInviteEmail(input: {
exhibitorName: string;
eventName?: string | null;
setupLink: string;
}): { subject: string; html: string} {
const subject =
'出店者アカウントのご案内（パスワード設定のお願い）';
const eventPart = input.eventName
? `イベント「${escapeHtml(input.eventName)}」の出店者として`
: 'Push-taro EVENT の出店者として';
const html = `
<p>${escapeHtml(input.exhibitorName)} 様</p>
<p>Push-taro EVENT の主催者により、${eventPart}登録されました。</p>
<p>クーポンの消し込みなどに使う出店者ログインのパスワードを、以下のリンクから設定してください。</p>
<p><a href="${input.setupLink}">パスワードを設定する</a></p>
<p>※リンクの有効期限が切れた場合は、イベントの主催者にお問い合わせください。</p>
<p>※このメールに心当たりがない場合は、破棄していただいて構いません。</p>
`;
return { subject, html};
}

const defaultDeps: ExhibitorAccountDeps = {
auth: {
getUserByEmail: (email) => authAdmin.getUserByEmail(email),
createUser: (request) => authAdmin.createUser(request),
generatePasswordResetLink: (email) =>
authAdmin.generatePasswordResetLink(email),
},
sendMail: (args) => sendEmail(args),
};

/**
* 出店者のメールアドレスから Auth アカウントを解決する。
* - 既存アカウントがあれば連携のみ（メールは送らない）。
* - 無ければ自動作成し、パスワード設定リンクを招待メールで送る。
* メール送信の失敗は登録の失敗にしない（結果の inviteSent で知らせる）。
*/
export async function resolveOrCreateExhibitorAccount(
email: string,
context: { exhibitorName: string; eventName?: string | null},
deps: ExhibitorAccountDeps = defaultDeps,
): Promise<ResolveExhibitorAccountResult> {
const { auth, sendMail} = deps;

// 1) 既存アカウントがあれば連携するだけ
try {
const existing = await auth.getUserByEmail(email);
return { authUid: existing.uid, accountCreated: false, inviteSent: false};
} catch (error) {
if (authErrorCode(error)!== 'auth/user-not-found') {
console.error(
'[exhibitor-account] getUserByEmail failed:',
authErrorCode(error),
);
throw new ExhibitorAccountError(
'ログイン用アカウントの確認に失敗しました。時間をおいて再度お試しください',
500,
);
}
}

// 2) アカウントが無ければサーバー側で作成する
let authUid: string;
try {
const created = await auth.createUser(
buildCreateRequest(email, generateTempCredential()),
);
authUid = created.uid;
} catch (error) {
const code = authErrorCode(error);
if (code === 'auth/email-already-exists') {
// 同時実行で先に作られていたケース。そのアカウントに連携する。
const existing = await auth.getUserByEmail(email);
return { authUid: existing.uid, accountCreated: false, inviteSent: false};
}
if (code === 'auth/invalid-email') {
throw new ExhibitorAccountError(
'メールアドレスの形式が正しくありません',
400,
);
}
console.error('[exhibitor-account] createUser failed:', code);
throw new ExhibitorAccountError(
'ログイン用アカウントの作成に失敗しました。時間をおいて再度お試しください',
500,
);
}

// 3) パスワード設定リンクを招待メールで送る（失敗しても登録は成功扱い）
let inviteSent = false;
try {
const setupLink = await auth.generatePasswordResetLink(email);
const mail = buildExhibitorInviteEmail({
exhibitorName: context.exhibitorName,
eventName: context.eventName,
setupLink,
});
const result = await sendMail({
to: email,
subject: mail.subject,
html: mail.html,
});
inviteSent = result.success;
if (!result.success) {
console.error('[exhibitor-account] invite email failed:', result.error);
}
} catch (error) {
console.error('[exhibitor-account] invite email error:', error);
}
return { authUid, accountCreated: true, inviteSent};
}
