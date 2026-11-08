// lib/ui-text.ts
// 画面の固定文の辞書（ja / en / zh / ko）。
// 人が書く文（配信・クーポン）は lib/translate.ts の自動翻訳が担い、
// ボタンや案内のような固定文はここで持つ。
// 言語の決まり方（個人 > イベントのデフォルト > 日本語）は lib/i18n.ts。

import { DEFAULT_LOCALE, type Locale } from './i18n';

export const UI_TEXT = {
  loading: {
    ja: '読み込み中…',
    en: 'Loading…',
    zh: '加载中…',
    ko: '로딩 중…',
  },
  language: {
    ja: '言語',
    en: 'Language',
    zh: '语言',
    ko: '언어',
  },
  notFoundTitle: {
    ja: 'イベントが見つかりません',
    en: 'Event not found',
    zh: '未找到活动',
    ko: '이벤트를 찾을 수 없습니다',
  },
  notFoundBody: {
    ja: 'QRコードをもう一度読み取ってください。',
    en: 'Please scan the QR code again.',
    zh: '请重新扫描二维码。',
    ko: 'QR 코드를 다시 스캔해 주세요.',
  },
  period: {
    ja: '開催期間: {start} 〜 {end}',
    en: 'Event period: {start} – {end}',
    zh: '活动期间：{start} 〜 {end}',
    ko: '개최 기간: {start} ~ {end}',
  },
  infoTitle: {
    ja: 'ご案内',
    en: 'Information',
    zh: '活动指南',
    ko: '안내',
  },
  endedMessage: {
    ja: 'このイベントは終了しました。',
    en: 'This event has ended.',
    zh: '本活动已结束。',
    ko: '이 이벤트는 종료되었습니다.',
  },
  notAccepting: {
    ja: 'このイベントは現在、登録を受け付けていません。',
    en: 'This event is not accepting registrations right now.',
    zh: '本活动目前不接受登记。',
    ko: '이 이벤트는 현재 등록을 받고 있지 않습니다.',
  },
  registerIntro: {
    ja: '会場からのお知らせとクーポンを受け取るには、電話番号で登録してください。',
    en: 'Register with your phone number to receive venue announcements and coupons.',
    zh: '请使用手机号码登记，以接收会场通知和优惠券。',
    ko: '회장 안내와 쿠폰을 받으려면 전화번호로 등록해 주세요.',
  },
  phoneLabel: {
    ja: '電話番号',
    en: 'Phone number',
    zh: '手机号码',
    ko: '전화번호',
  },
  phoneFormatError: {
    ja: '電話番号は09012345678、または+819012345678の形式で入力してください。',
    en: 'Enter your phone number like 09012345678 or +819012345678.',
    zh: '请按 09012345678 或 +819012345678 的格式输入手机号码。',
    ko: '전화번호는 09012345678 또는 +819012345678 형식으로 입력해 주세요.',
  },
  sendCode: {
    ja: 'SMSで認証コードを送る',
    en: 'Send verification code by SMS',
    zh: '通过短信发送验证码',
    ko: 'SMS로 인증 코드 보내기',
  },
  codeSent: {
    ja: 'SMSで届いた認証コードを入力してください。',
    en: 'Enter the verification code sent by SMS.',
    zh: '请输入短信收到的验证码。',
    ko: 'SMS로 받은 인증 코드를 입력해 주세요.',
  },
  sendCodeFailed: {
    ja: '認証コードの送信に失敗しました（{code}）。',
    en: 'Failed to send the verification code ({code}).',
    zh: '验证码发送失败（{code}）。',
    ko: '인증 코드 전송에 실패했습니다({code}).',
  },
  codeLabel: {
    ja: '認証コード',
    en: 'Verification code',
    zh: '验证码',
    ko: '인증 코드',
  },
  codePlaceholder: {
    ja: '6桁のコード',
    en: '6-digit code',
    zh: '6位验证码',
    ko: '6자리 코드',
  },
  confirmCode: {
    ja: '認証する',
    en: 'Verify',
    zh: '验证',
    ko: '인증하기',
  },
  codeWrong: {
    ja: '認証コードが正しくありません（{code}）。',
    en: 'The verification code is incorrect ({code}).',
    zh: '验证码不正确（{code}）。',
    ko: '인증 코드가 올바르지 않습니다({code}).',
  },
  iosStandalone: {
    ja: 'iPhoneでは通知の受け取りに「ホーム画面に追加」が必要です。\n\n1. Safari下部の「共有ボタン」をタップ\n2. 「ホーム画面に追加」を選択\n3. ホーム画面に作成されたアイコンから開いて、もう一度登録してください。',
    en: 'On iPhone, you need to add this page to your Home Screen to receive notifications.\n\n1. Tap the Share button at the bottom of Safari\n2. Choose "Add to Home Screen"\n3. Open the icon created on your Home Screen and register again.',
    zh: '在 iPhone 上，需要先将本页面添加到主屏幕才能接收通知。\n\n1. 点按 Safari 底部的"分享"按钮\n2. 选择"添加到主屏幕"\n3. 从主屏幕上创建的图标打开，并重新登记。',
    ko: 'iPhone에서는 알림을 받으려면 "홈 화면에 추가"가 필요합니다.\n\n1. Safari 하단의 "공유" 버튼을 탭\n2. "홈 화면에 추가"를 선택\n3. 홈 화면에 만들어진 아이콘으로 열고 다시 등록해 주세요.',
  },
  permissionDenied: {
    ja: '通知が許可されませんでした。ブラウザの設定で通知を許可してください。',
    en: 'Notifications were not allowed. Please allow notifications in your browser settings.',
    zh: '未获得通知许可。请在浏览器设置中允许通知。',
    ko: '알림이 허용되지 않았습니다. 브라우저 설정에서 알림을 허용해 주세요.',
  },
  tokenFailed: {
    ja: '通知トークンの取得に失敗しました。対応ブラウザでお試しください。',
    en: 'Failed to get a notification token. Please try a supported browser.',
    zh: '获取通知令牌失败。请使用受支持的浏览器重试。',
    ko: '알림 토큰을 가져오지 못했습니다. 지원되는 브라우저에서 시도해 주세요.',
  },
  registerFailed: {
    ja: '登録に失敗しました。',
    en: 'Registration failed.',
    zh: '登记失败。',
    ko: '등록에 실패했습니다.',
  },
  registerRetry: {
    ja: '登録に失敗しました。通信環境を確認してもう一度お試しください。',
    en: 'Registration failed. Check your connection and try again.',
    zh: '登记失败。请检查网络连接后重试。',
    ko: '등록에 실패했습니다. 통신 환경을 확인하고 다시 시도해 주세요.',
  },
  verifiedIntro: {
    ja: '電話番号の認証が完了しました。最後に通知の許可をしてください。',
    en: 'Your phone number is verified. Finally, please allow notifications.',
    zh: '手机号码验证已完成。最后请允许通知。',
    ko: '전화번호 인증이 완료되었습니다. 마지막으로 알림을 허용해 주세요.',
  },
  registerButton: {
    ja: '通知を登録する',
    en: 'Register for notifications',
    zh: '登记接收通知',
    ko: '알림 등록하기',
  },
  doneTitle: {
    ja: '登録が完了しました',
    en: 'Registration complete',
    zh: '登记完成',
    ko: '등록이 완료되었습니다',
  },
  dailyResetNote: {
    ja: '通知登録は毎日リセットされます。翌日も通知を受け取るには、もう一度このページから登録してください。',
    en: 'Notification registration resets every day. To keep receiving notifications tomorrow, register again from this page.',
    zh: '通知登记每天都会重置。如需次日继续接收通知，请再次在此页面登记。',
    ko: '알림 등록은 매일 초기화됩니다. 다음 날에도 알림을 받으려면 이 페이지에서 다시 등록해 주세요.',
  },
  keepPhonesNote: {
    ja: '電話番号とクーポンの取得・利用記録は会期中保持され、イベント終了時に消去されます。',
    en: 'Your phone number and coupon claim/redemption records are kept during the event period and deleted when the event ends.',
    zh: '您的手机号码以及优惠券领取和使用记录将在活动期间保留，活动结束时删除。',
    ko: '전화번호와 쿠폰 취득·사용 기록은 행사 기간 동안 보관되며, 이벤트 종료 시 삭제됩니다.',
  },
  fullDailyNote: {
    ja: '電話番号も含め、登録情報は毎日すべて消去されます。',
    en: 'All registration data, including your phone number, is deleted every day.',
    zh: '包括手机号码在内的所有登记信息每天都会全部删除。',
    ko: '전화번호를 포함해 등록 정보는 매일 모두 삭제됩니다.',
  },
  couponsTitle: {
    ja: 'クーポン',
    en: 'Coupons',
    zh: '优惠券',
    ko: '쿠폰',
  },
  searchPlaceholder: {
    ja: '会社名・キーワードで検索',
    en: 'Search by company name or keyword',
    zh: '按公司名称或关键词搜索',
    ko: '회사명·키워드로 검색',
  },
  searchButton: {
    ja: '検索',
    en: 'Search',
    zh: '搜索',
    ko: '검색',
  },
  noCoupons: {
    ja: 'クーポンがありません。',
    en: 'No coupons available.',
    zh: '暂无优惠券。',
    ko: '쿠폰이 없습니다.',
  },
  claimButton: {
    ja: '取得する',
    en: 'Get coupon',
    zh: '领取',
    ko: '받기',
  },
  claimedButton: {
    ja: '取得済み',
    en: 'Claimed',
    zh: '已领取',
    ko: '취득 완료',
  },
  redeemedButton: {
    ja: '消込済み',
    en: 'Redeemed',
    zh: '已使用',
    ko: '사용 완료',
  },
  claimFailed: {
    ja: 'クーポンの取得に失敗しました。',
    en: 'Failed to claim the coupon.',
    zh: '优惠券领取失败。',
    ko: '쿠폰 취득에 실패했습니다.',
  },
  claimedMessage: {
    ja: 'クーポンを取得しました。ブースでQRコードを見せてください。',
    en: 'Coupon claimed. Show the QR code at the booth.',
    zh: '已领取优惠券。请在展位出示二维码。',
    ko: '쿠폰을 취득했습니다. 부스에서 QR 코드를 보여 주세요.',
  },
  myCouponsTitle: {
    ja: '取得済みクーポン',
    en: 'My coupons',
    zh: '已领取的优惠券',
    ko: '취득한 쿠폰',
  },
  redeemedNote: {
    ja: '消込済みです',
    en: 'Already redeemed',
    zh: '已使用',
    ko: '사용 완료되었습니다',
  },
  showQrNote: {
    ja: 'ブースでこのQRコードを見せてください',
    en: 'Show this QR code at the booth',
    zh: '请在展位出示此二维码',
    ko: '부스에서 이 QR 코드를 보여 주세요',
  },
  deletedCoupon: {
    ja: '（削除されたクーポン）',
    en: '(Deleted coupon)',
    zh: '（已删除的优惠券）',
    ko: '(삭제된 쿠폰)',
  },
} as const satisfies Record<string, Record<Locale, string>>;

export type UiTextKey = keyof typeof UI_TEXT;

type TextDict = Record<string, Record<Locale, string>>;

function lookup(
  dict: TextDict,
  locale: Locale,
  key: string,
  params?: Record<string, string>,
): string {
  const entry = dict[key];
  let text: string = entry?.[locale] ?? entry?.[DEFAULT_LOCALE] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, value);
    }
  }
  return text;
}

/** 来場者画面の固定文を言語で引く（{name} 形式の差し込み対応）。 */
export function uiText(
  locale: Locale,
  key: UiTextKey,
  params?: Record<string, string>,
): string {
  return lookup(UI_TEXT, locale, key, params);
}

// ─── 出店者 消込画面 ───

export const REDEEM_TEXT = {
  redeemLoginTitle: {
    ja: '出店者 消込ログイン',
    en: 'Exhibitor redemption login',
    zh: '参展商核销登录',
    ko: '출점자 사용 처리 로그인',
  },
  emailLabel: {
    ja: 'メールアドレス',
    en: 'Email address',
    zh: '电子邮箱',
    ko: '이메일 주소',
  },
  passwordLabel: {
    ja: 'パスワード',
    en: 'Password',
    zh: '密码',
    ko: '비밀번호',
  },
  loginButton: {
    ja: 'ログイン',
    en: 'Log in',
    zh: '登录',
    ko: '로그인',
  },
  loginFailed: {
    ja: 'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
    en: 'Login failed. Please check your email address and password.',
    zh: '登录失败。请确认电子邮箱和密码。',
    ko: '로그인에 실패했습니다. 이메일 주소와 비밀번호를 확인해 주세요.',
  },
  redeemTitle: {
    ja: 'クーポン消込',
    en: 'Coupon redemption',
    zh: '优惠券核销',
    ko: '쿠폰 사용 처리',
  },
  logoutButton: {
    ja: 'ログアウト',
    en: 'Log out',
    zh: '退出登录',
    ko: '로그아웃',
  },
  exhibitorLoadFailed: {
    ja: '出店者情報の取得に失敗しました',
    en: 'Failed to load exhibitor information',
    zh: '获取参展商信息失败',
    ko: '출점자 정보를 가져오지 못했습니다',
  },
  exhibitorErrorNote: {
    ja: '。主催者にアカウントの登録状況を確認してください。',
    en: '. Please ask the organizer to check your account registration.',
    zh: '。请向主办方确认您的账户注册状态。',
    ko: '. 주최자에게 계정 등록 상태를 확인해 주세요.',
  },
  exhibitorLine: {
    ja: '出店者: {name}（自社のクーポンのみ消込できます）',
    en: 'Exhibitor: {name} (you can redeem only your own coupons)',
    zh: '参展商：{name}（只能核销本公司的优惠券）',
    ko: '출점자: {name}(자사 쿠폰만 사용 처리할 수 있습니다)',
  },
  cameraStart: {
    ja: 'カメラでQRコードを読み取る',
    en: 'Scan QR code with camera',
    zh: '用相机扫描二维码',
    ko: '카메라로 QR 코드 읽기',
  },
  cameraStop: {
    ja: 'カメラを止める',
    en: 'Stop camera',
    zh: '停止相机',
    ko: '카메라 중지',
  },
  cameraDenied: {
    ja: 'カメラの使用が許可されていません。ブラウザの設定からカメラ利用を許可してください。',
    en: 'Camera use is not allowed. Please allow camera access in your browser settings.',
    zh: '未获得相机使用许可。请在浏览器设置中允许使用相机。',
    ko: '카메라 사용이 허용되지 않았습니다. 브라우저 설정에서 카메라 사용을 허용해 주세요.',
  },
  cameraNotFound: {
    ja: 'カメラが見つかりません。カメラ付きの端末でお試しください。',
    en: 'No camera found. Please use a device with a camera.',
    zh: '未找到相机。请使用带相机的设备。',
    ko: '카메라를 찾을 수 없습니다. 카메라가 있는 기기에서 시도해 주세요.',
  },
  cameraFailed: {
    ja: 'カメラの起動に失敗しました。コードを手入力してください。',
    en: 'Failed to start the camera. Please enter the code manually.',
    zh: '相机启动失败。请手动输入代码。',
    ko: '카메라를 시작하지 못했습니다. 코드를 직접 입력해 주세요.',
  },
  manualLabel: {
    ja: 'コードを手入力する場合',
    en: 'Or enter the code manually',
    zh: '手动输入代码',
    ko: '코드를 직접 입력하는 경우',
  },
  claimCodePlaceholder: {
    ja: '取得コード',
    en: 'Claim code',
    zh: '领取代码',
    ko: '취득 코드',
  },
  redeemButton: {
    ja: '消し込む',
    en: 'Redeem',
    zh: '核销',
    ko: '사용 처리',
  },
  redeemDone: {
    ja: '消込が完了しました。',
    en: 'Redemption complete.',
    zh: '核销完成。',
    ko: '사용 처리가 완료되었습니다.',
  },
  redeemFailed: {
    ja: '消込に失敗しました。',
    en: 'Redemption failed.',
    zh: '核销失败。',
    ko: '사용 처리에 실패했습니다.',
  },
  ownCouponsTitle: {
    ja: '自社のクーポン',
    en: 'Your coupons',
    zh: '本公司的优惠券',
    ko: '자사 쿠폰',
  },
  noOwnCoupons: {
    ja: '登録されているクーポンがありません。',
    en: 'No coupons registered.',
    zh: '没有已登记的优惠券。',
    ko: '등록된 쿠폰이 없습니다.',
  },
  couponInactive: {
    ja: '現在無効',
    en: 'Currently inactive',
    zh: '当前无效',
    ko: '현재 비활성',
  },
  loginRequired: {
    ja: 'ログインが必要です',
    en: 'Login is required',
    zh: '需要登录',
    ko: '로그인이 필요합니다',
  },
  apiError: {
    ja: 'エラー ({status})',
    en: 'Error ({status})',
    zh: '错误（{status}）',
    ko: '오류({status})',
  },
} as const satisfies Record<string, Record<Locale, string>>;

export type RedeemTextKey = keyof typeof REDEEM_TEXT;

/** 出店者 消込画面の固定文を言語で引く。 */
export function redeemText(
  locale: Locale,
  key: RedeemTextKey,
  params?: Record<string, string>,
): string {
  return lookup(REDEEM_TEXT, locale, key, params);
}
