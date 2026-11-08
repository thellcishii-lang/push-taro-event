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
  showQr: {
    ja: 'QRコードを表示',
    en: 'Show QR code',
    zh: '显示二维码',
    ko: 'QR 코드 표시',
  },
  hideQr: {
    ja: 'QRコードを閉じる',
    en: 'Hide QR code',
    zh: '关闭二维码',
    ko: 'QR 코드 닫기',
  },
  usedStamp: {
    ja: '使用済み',
    en: 'USED',
    zh: '已使用',
    ko: '사용 완료',
  },
  catalogTitle: {
    ja: 'クーポンカタログ',
    en: 'Coupon catalog',
    zh: '优惠券目录',
    ko: '쿠폰 카탈로그',
  },
  couponCount: {
    ja: 'クーポン {count}件',
    en: '{count} coupons',
    zh: '{count} 张优惠券',
    ko: '쿠폰 {count}장',
  },
  itemsCount: {
    ja: '{count}件',
    en: '{count} items',
    zh: '{count} 件',
    ko: '{count}건',
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
  scannerTitle: {
    ja: 'QRコードスキャナー',
    en: 'QR code scanner',
    zh: '二维码扫描',
    ko: 'QR 코드 스캐너',
  },
  scanHint: {
    ja: '来場者のクーポンQRコードをカメラに向けてください',
    en: "Point the camera at the visitor's coupon QR code",
    zh: '请将来访者的优惠券二维码对准摄像头',
    ko: '방문객의 쿠폰 QR 코드를 카메라에 비춰 주세요',
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
  redeemDoneTitle: {
    ja: '消込完了',
    en: 'Redemption complete',
    zh: '核销完成',
    ko: '사용 처리 완료',
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

// ─── 主催者 管理画面 ───

export const ADMIN_TEXT = {
  adminLoginTitle: {
    ja: 'Push-taro EVENT 管理ログイン',
    en: 'Push-taro EVENT admin login',
    zh: 'Push-taro EVENT 管理登录',
    ko: 'Push-taro EVENT 관리 로그인',
  },
  adminTitle: {
    ja: 'Push-taro EVENT イベント設定',
    en: 'Push-taro EVENT event settings',
    zh: 'Push-taro EVENT 活动设置',
    ko: 'Push-taro EVENT 이벤트 설정',
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
  logoutButton: {
    ja: 'ログアウト',
    en: 'Log out',
    zh: '退出登录',
    ko: '로그아웃',
  },
  loadFailed: {
    ja: '読み込みに失敗しました',
    en: 'Failed to load',
    zh: '加载失败',
    ko: '불러오기에 실패했습니다',
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
  navPush: {
    ja: '① プッシュ＋消込',
    en: '① Push + Redeem',
    zh: '① 推送＋核销',
    ko: '① 푸시＋사용 처리',
  },
  navSchedule: {
    ja: '② 予約配信',
    en: '② Scheduled push',
    zh: '② 预约推送',
    ko: '② 예약 발송',
  },
  navCoupons: {
    ja: '③ クーポン管理',
    en: '③ Coupons',
    zh: '③ 优惠券管理',
    ko: '③ 쿠폰 관리',
  },
  navSettings: {
    ja: 'イベント設定',
    en: 'Event settings',
    zh: '活动设置',
    ko: '이벤트 설정',
  },
  eventsListTitle: {
    ja: 'イベント一覧',
    en: 'Events',
    zh: '活动列表',
    ko: '이벤트 목록',
  },
  noEvents: {
    ja: 'まだイベントがありません。',
    en: 'No events yet.',
    zh: '尚无活动。',
    ko: '아직 이벤트가 없습니다.',
  },
  statusDraft: {
    ja: '下書き',
    en: 'Draft',
    zh: '草稿',
    ko: '초안',
  },
  statusLive: {
    ja: '開催中',
    en: 'Live',
    zh: '进行中',
    ko: '진행 중',
  },
  statusEnded: {
    ja: '終了',
    en: 'Ended',
    zh: '已结束',
    ko: '종료',
  },
  eventMeta: {
    ja: '{start} 〜 {end}／状態: {status}／リセット: {mode} {time}',
    en: '{start} – {end} / Status: {status} / Reset: {mode} {time}',
    zh: '{start} 〜 {end}／状态：{status}／重置：{mode} {time}',
    ko: '{start} ~ {end} / 상태: {status} / 리셋: {mode} {time}',
  },
  resetModeFullShort: {
    ja: '毎日フルリセット',
    en: 'Full reset daily',
    zh: '每天完全重置',
    ko: '매일 전체 리셋',
  },
  resetModeKeepShort: {
    ja: '期間中は電話番号を保持',
    en: 'Keep phone numbers during the event',
    zh: '活动期间保留手机号码',
    ko: '기간 중 전화번호 유지',
  },
  newEventButton: {
    ja: '＋ 新規イベント',
    en: '+ New event',
    zh: '＋ 新建活动',
    ko: '＋ 새 이벤트',
  },
  editEventTitle: {
    ja: '編集：{name}',
    en: 'Edit: {name}',
    zh: '编辑：{name}',
    ko: '편집: {name}',
  },
  newEventTitle: {
    ja: '新規イベント作成',
    en: 'Create a new event',
    zh: '新建活动',
    ko: '새 이벤트 만들기',
  },
  eventNameLabel: {
    ja: 'イベント名',
    en: 'Event name',
    zh: '活动名称',
    ko: '이벤트 이름',
  },
  startDateLabel: {
    ja: '開始日',
    en: 'Start date',
    zh: '开始日期',
    ko: '시작일',
  },
  endDateLabel: {
    ja: '終了日',
    en: 'End date',
    zh: '结束日期',
    ko: '종료일',
  },
  resetModeLegend: {
    ja: '日次リセット方式',
    en: 'Daily reset mode',
    zh: '每日重置方式',
    ko: '일일 리셋 방식',
  },
  resetModeFull: {
    ja: '毎日フルリセット（購読も電話番号も毎日消去）',
    en: 'Full reset daily (subscriptions and phone numbers are deleted every day)',
    zh: '每天完全重置（订阅和手机号码每天删除）',
    ko: '매일 전체 리셋(구독도 전화번호도 매일 삭제)',
  },
  resetModeKeep: {
    ja: '期間中は保持（毎日リセットは購読のみ。電話番号と取得・消込記録は終了時に消去）',
    en: 'Keep during the event (daily reset clears subscriptions only; phone numbers and claim/redemption records are deleted at the end)',
    zh: '活动期间保留（每日重置仅清除订阅；手机号码及领取、核销记录在结束时删除）',
    ko: '기간 중 유지(매일 리셋은 구독만 삭제. 전화번호와 취득·사용 기록은 종료 시 삭제)',
  },
  resetTimeLabel: {
    ja: 'リセット時刻（JST）',
    en: 'Reset time (JST)',
    zh: '重置时间（JST）',
    ko: '리셋 시각(JST)',
  },
  defaultLocaleLabel: {
    ja: 'デフォルト言語',
    en: 'Default language',
    zh: '默认语言',
    ko: '기본 언어',
  },
  defaultLocaleNote: {
    ja: '来場者・出店者の初期表示言語です。本人は自分の言語に変更できます。',
    en: 'The initial display language for visitors and exhibitors. Each person can change it to their own language.',
    zh: '访客和参展商的初始显示语言。本人可以更改为自己的语言。',
    ko: '방문자와 출점자의 초기 표시 언어입니다. 본인이 자신의 언어로 변경할 수 있습니다.',
  },
  subscriberCapLabel: {
    ja: '購読者上限（契約枠）',
    en: 'Subscriber cap (contract)',
    zh: '订阅者上限（合同额度）',
    ko: '구독자 상한(계약 한도)',
  },
  peopleSuffix: {
    ja: '人',
    en: ' people',
    zh: '人',
    ko: '명',
  },
  capDefaultNote: {
    ja: '（既定）',
    en: ' (default)',
    zh: '（默认）',
    ko: '(기본값)',
  },
  subscriberCapNote: {
    ja: '※料金プランに連動するため、変更は運営側で行います',
    en: '* Linked to the pricing plan; changes are made by the operator.',
    zh: '※与收费方案关联，变更由运营方进行',
    ko: '※요금 플랜과 연동되므로 변경은 운영 측에서 합니다',
  },
  backupDaysLabel: {
    ja: 'レポートのバックアップ保持日数（運営用）',
    en: 'Report backup retention days (operator)',
    zh: '报告备份保留天数（运营用）',
    ko: '리포트 백업 보관 일수(운영용)',
  },
  statusFieldLabel: {
    ja: '状態',
    en: 'Status',
    zh: '状态',
    ko: '상태',
  },
  statusOptionLive: {
    ja: '開催中（リセット・終了処理の対象）',
    en: 'Live (subject to reset and finalization)',
    zh: '进行中（重置与结束处理的对象）',
    ko: '진행 중(리셋·종료 처리 대상)',
  },
  saveButton: {
    ja: '保存する',
    en: 'Save',
    zh: '保存',
    ko: '저장',
  },
  createButton: {
    ja: '作成する',
    en: 'Create',
    zh: '创建',
    ko: '만들기',
  },
  savedMessage: {
    ja: '保存しました',
    en: 'Saved',
    zh: '已保存',
    ko: '저장했습니다',
  },
  createdMessage: {
    ja: 'イベントを作成しました',
    en: 'Event created',
    zh: '活动已创建',
    ko: '이벤트를 만들었습니다',
  },
  saveFailed: {
    ja: '保存に失敗しました',
    en: 'Failed to save',
    zh: '保存失败',
    ko: '저장에 실패했습니다',
  },
  pushPageTitle: {
    ja: 'プッシュ通知＋消込',
    en: 'Push + Redemption',
    zh: '推送通知＋核销',
    ko: '푸시 알림＋사용 처리',
  },
  instantPushTitle: {
    ja: '即時プッシュ',
    en: 'Instant push',
    zh: '即时推送',
    ko: '즉시 푸시',
  },
  titleLabel: {
    ja: 'タイトル',
    en: 'Title',
    zh: '标题',
    ko: '제목',
  },
  bodyLabel: {
    ja: '本文',
    en: 'Body',
    zh: '正文',
    ko: '본문',
  },
  sendNowButton: {
    ja: '今すぐ配信する',
    en: 'Send now',
    zh: '立即发送',
    ko: '지금 발송',
  },
  confirmSend: {
    ja: 'この内容で即時配信します。よろしいですか？',
    en: 'Send this push now. Are you sure?',
    zh: '以此内容立即发送。确定吗？',
    ko: '이 내용으로 즉시 발송합니다. 괜찮습니까?',
  },
  sentMessage: {
    ja: '配信しました（送信数: {count}）',
    en: 'Sent (recipients: {count})',
    zh: '已发送（发送数：{count}）',
    ko: '발송했습니다(발송 수: {count})',
  },
  sendFailed: {
    ja: '配信に失敗しました',
    en: 'Failed to send',
    zh: '发送失败',
    ko: '발송에 실패했습니다',
  },
  organizerRedeemTitle: {
    ja: 'クーポン消込（主催者）',
    en: 'Coupon redemption (organizer)',
    zh: '优惠券核销（主办方）',
    ko: '쿠폰 사용 처리(주최자)',
  },
  claimCodeLabel: {
    ja: '取得コード',
    en: 'Claim code',
    zh: '领取代码',
    ko: '취득 코드',
  },
  claimCodePlaceholder: {
    ja: '来場者の取得コード',
    en: 'Visitor claim code',
    zh: '访客的领取代码',
    ko: '방문자의 취득 코드',
  },
  redeemButton: {
    ja: '消し込む',
    en: 'Redeem',
    zh: '核销',
    ko: '사용 처리',
  },
  redeemDoneMessage: {
    ja: '消込が完了しました',
    en: 'Redemption complete',
    zh: '核销完成',
    ko: '사용 처리가 완료되었습니다',
  },
  redeemFailedMessage: {
    ja: '消込に失敗しました',
    en: 'Redemption failed',
    zh: '核销失败',
    ko: '사용 처리에 실패했습니다',
  },
  historyTitle: {
    ja: '配信履歴（送信数＝課金の根拠）',
    en: 'Delivery history (recipient count is the billing basis)',
    zh: '发送历史（发送数＝计费依据）',
    ko: '발송 이력(발송 수 = 과금 근거)',
  },
  noHistory: {
    ja: 'まだ配信履歴がありません。',
    en: 'No delivery history yet.',
    zh: '尚无发送历史。',
    ko: '아직 발송 이력이 없습니다.',
  },
  historySent: {
    ja: '送信済み {sentAt}／送信数 {count}',
    en: 'Sent {sentAt} / Recipients {count}',
    zh: '已发送 {sentAt}／发送数 {count}',
    ko: '발송 완료 {sentAt} / 발송 수 {count}',
  },
  historyFailed: {
    ja: '失敗: {error}',
    en: 'Failed: {error}',
    zh: '失败：{error}',
    ko: '실패: {error}',
  },
  schedulePageTitle: {
    ja: '予約配信',
    en: 'Scheduled push',
    zh: '预约推送',
    ko: '예약 발송',
  },
  newScheduleTitle: {
    ja: '新しい予約',
    en: 'New schedule',
    zh: '新建预约',
    ko: '새 예약',
  },
  dateLabel: {
    ja: '配信日',
    en: 'Delivery date',
    zh: '发送日期',
    ko: '발송일',
  },
  timeLabel: {
    ja: '時刻（15分刻み）',
    en: 'Time (15-minute slots)',
    zh: '时间（15分钟间隔）',
    ko: '시각(15분 단위)',
  },
  scheduleButton: {
    ja: '予約する',
    en: 'Schedule',
    zh: '预约',
    ko: '예약하기',
  },
  scheduledMessage: {
    ja: '予約しました: {date} {time}',
    en: 'Scheduled: {date} {time}',
    zh: '已预约：{date} {time}',
    ko: '예약했습니다: {date} {time}',
  },
  scheduleFailed: {
    ja: '予約に失敗しました',
    en: 'Failed to schedule',
    zh: '预约失败',
    ko: '예약에 실패했습니다',
  },
  confirmCancel: {
    ja: 'この予約を取り消しますか？',
    en: 'Cancel this schedule?',
    zh: '取消此预约吗？',
    ko: '이 예약을 취소합니까?',
  },
  cancelledMessage: {
    ja: '予約を取り消しました',
    en: 'Schedule cancelled',
    zh: '已取消预约',
    ko: '예약을 취소했습니다',
  },
  cancelFailed: {
    ja: '取り消しに失敗しました',
    en: 'Failed to cancel',
    zh: '取消失败',
    ko: '취소에 실패했습니다',
  },
  scheduledListTitle: {
    ja: '予約中（{count}件）',
    en: 'Scheduled ({count})',
    zh: '预约中（{count}条）',
    ko: '예약 중({count}건)',
  },
  noScheduled: {
    ja: '予約はありません。',
    en: 'No schedules.',
    zh: '暂无预约。',
    ko: '예약이 없습니다.',
  },
  cancelButton: {
    ja: '取り消す',
    en: 'Cancel',
    zh: '取消',
    ko: '취소',
  },
  scheduleHistoryTitle: {
    ja: '予約配信の履歴',
    en: 'Scheduled delivery history',
    zh: '预约推送历史',
    ko: '예약 발송 이력',
  },
  noScheduleHistory: {
    ja: '履歴はありません。',
    en: 'No history.',
    zh: '暂无历史。',
    ko: '이력이 없습니다.',
  },
  historyReservedPrefix: {
    ja: '予約 {at}／',
    en: 'Scheduled {at} / ',
    zh: '预约 {at}／',
    ko: '예약 {at} / ',
  },
  histSent: {
    ja: '送信済み 送信数 {count}',
    en: 'Sent, recipients {count}',
    zh: '已发送 发送数 {count}',
    ko: '발송 완료 발송 수 {count}',
  },
  histCancelled: {
    ja: '取り消し済み',
    en: 'Cancelled',
    zh: '已取消',
    ko: '취소됨',
  },
  couponsPageTitle: {
    ja: 'クーポン管理',
    en: 'Coupon management',
    zh: '优惠券管理',
    ko: '쿠폰 관리',
  },
  exhibitorsTitle: {
    ja: '出店者（{count}社）',
    en: 'Exhibitors ({count})',
    zh: '参展商（{count}家）',
    ko: '출점자({count}개사)',
  },
  loginLinked: {
    ja: 'ログイン連携済み',
    en: 'Login linked',
    zh: '已关联登录',
    ko: '로그인 연동 완료',
  },
  loginNotLinked: {
    ja: 'ログイン未連携',
    en: 'Login not linked',
    zh: '未关联登录',
    ko: '로그인 미연동',
  },
  exhibitorNameLabel: {
    ja: '出店者名（会社名）',
    en: 'Exhibitor name (company)',
    zh: '参展商名称（公司名）',
    ko: '출점자명(회사명)',
  },
  exhibitorEmailLabel: {
    ja: '消込ログイン用メールアドレス（任意）',
    en: 'Email for redemption login (optional)',
    zh: '核销登录邮箱（可选）',
    ko: '사용 처리 로그인용 이메일(선택)',
  },
  exhibitorEmailNote: {
    ja: '出店者のログイン用アカウント（メール+パスワード）を先に作成しておくと、そのメールアドレスで連携できます。',
    en: 'If you create the exhibitor login account (email + password) first, it can be linked by that email address.',
    zh: '若先创建参展商登录账户（邮箱+密码），即可用该邮箱关联。',
    ko: '출점자 로그인 계정(이메일+비밀번호)을 먼저 만들어 두면 그 이메일로 연동할 수 있습니다.',
  },
  addExhibitorButton: {
    ja: '出店者を登録',
    en: 'Add exhibitor',
    zh: '登记参展商',
    ko: '출점자 등록',
  },
  exhibitorAdded: {
    ja: '出店者を登録しました',
    en: 'Exhibitor added',
    zh: '参展商已登记',
    ko: '출점자를 등록했습니다',
  },
  exhibitorAddFailed: {
    ja: '出店者の登録に失敗しました',
    en: 'Failed to add exhibitor',
    zh: '参展商登记失败',
    ko: '출점자 등록에 실패했습니다',
  },
  couponsCountTitle: {
    ja: 'クーポン（{count} / {cap}件）',
    en: 'Coupons ({count} / {cap})',
    zh: '优惠券（{count} / {cap}张）',
    ko: '쿠폰({count} / {cap}개)',
  },
  capNote: {
    ja: '上限は契約枠のため、変更は運営側で行います。',
    en: 'The cap is part of the contract; changes are made by the operator.',
    zh: '上限为合同额度，变更由运营方进行。',
    ko: '상한은 계약 한도이므로 변경은 운영 측에서 합니다.',
  },
  keywordsSuffix: {
    ja: '／キーワード: {keywords}',
    en: ' / Keywords: {keywords}',
    zh: '／关键词：{keywords}',
    ko: ' / 키워드: {keywords}',
  },
  inactiveSuffix: {
    ja: '／現在無効',
    en: ' / Inactive',
    zh: '／当前无效',
    ko: ' / 현재 비활성',
  },
  exhibitorSelectLabel: {
    ja: '出店者',
    en: 'Exhibitor',
    zh: '参展商',
    ko: '출점자',
  },
  selectPlaceholder: {
    ja: '選択してください',
    en: 'Please select',
    zh: '请选择',
    ko: '선택해 주세요',
  },
  couponTitleLabel: {
    ja: 'タイトル',
    en: 'Title',
    zh: '标题',
    ko: '제목',
  },
  couponDescLabel: {
    ja: '説明（任意）',
    en: 'Description (optional)',
    zh: '说明（可选）',
    ko: '설명(선택)',
  },
  couponKeywordsLabel: {
    ja: '検索キーワード（カンマ区切り、任意）',
    en: 'Search keywords (comma-separated, optional)',
    zh: '搜索关键词（逗号分隔，可选）',
    ko: '검색 키워드(쉼표 구분, 선택)',
  },
  couponKeywordsPlaceholder: {
    ja: '例: 飲み物, 無料',
    en: 'e.g. drinks, free',
    zh: '例：饮料, 免费',
    ko: '예: 음료, 무료',
  },
  addCouponButton: {
    ja: 'クーポンを登録',
    en: 'Add coupon',
    zh: '登记优惠券',
    ko: '쿠폰 등록',
  },
  couponAdded: {
    ja: 'クーポンを登録しました',
    en: 'Coupon added',
    zh: '优惠券已登记',
    ko: '쿠폰을 등록했습니다',
  },
  couponAddFailed: {
    ja: 'クーポンの登録に失敗しました',
    en: 'Failed to add coupon',
    zh: '优惠券登记失败',
    ko: '쿠폰 등록에 실패했습니다',
  },
  pdfsTitle: {
    ja: '案内PDF（{count} / 5件）',
    en: 'Info PDFs ({count} / 5)',
    zh: '指南PDF（{count} / 5份）',
    ko: '안내 PDF({count} / 5개)',
  },
  pdfsNote: {
    ja: '来場者画面にカードとして表示されます（例: 会場案内、タイムスケジュール）。',
    en: 'Shown as cards on the visitor screen (e.g. venue guide, timetable).',
    zh: '将以卡片形式显示在访客页面（例：会场指南、时间表）。',
    ko: '방문자 화면에 카드로 표시됩니다(예: 회장 안내, 타임스케줄).',
  },
  deleteButton: {
    ja: '削除',
    en: 'Delete',
    zh: '删除',
    ko: '삭제',
  },
  confirmDeletePdf: {
    ja: 'このPDFを削除しますか？',
    en: 'Delete this PDF?',
    zh: '删除此PDF吗？',
    ko: '이 PDF를 삭제합니까?',
  },
  pdfDeleted: {
    ja: 'PDFを削除しました',
    en: 'PDF deleted',
    zh: 'PDF已删除',
    ko: 'PDF를 삭제했습니다',
  },
  pdfDeleteFailed: {
    ja: 'PDFの削除に失敗しました',
    en: 'Failed to delete PDF',
    zh: 'PDF删除失败',
    ko: 'PDF 삭제에 실패했습니다',
  },
  pdfTitleLabel: {
    ja: '表示タイトル（任意。空ならファイル名）',
    en: 'Display title (optional; file name if empty)',
    zh: '显示标题（可选；为空则用文件名）',
    ko: '표시 제목(선택. 비우면 파일명)',
  },
  pdfTitlePlaceholder: {
    ja: '例: 会場案内',
    en: 'e.g. Venue guide',
    zh: '例：会场指南',
    ko: '예: 회장 안내',
  },
  pdfUploading: {
    ja: 'アップロード中…',
    en: 'Uploading…',
    zh: '上传中…',
    ko: '업로드 중…',
  },
  pdfCapReached: {
    ja: '上限（5件）に達しています',
    en: 'Limit reached (5)',
    zh: '已达到上限（5份）',
    ko: '상한(5개)에 도달했습니다',
  },
  pdfDropHint: {
    ja: 'PDFをドラッグ＆ドロップ、またはクリックして選択',
    en: 'Drag & drop a PDF, or click to select',
    zh: '拖放PDF，或点击选择',
    ko: 'PDF를 드래그＆드롭하거나 클릭하여 선택',
  },
  pdfAdded: {
    ja: '案内PDFを登録しました',
    en: 'Info PDF added',
    zh: '指南PDF已登记',
    ko: '안내 PDF를 등록했습니다',
  },
  pdfAddFailed: {
    ja: 'PDFの登録に失敗しました',
    en: 'Failed to add PDF',
    zh: 'PDF登记失败',
    ko: 'PDF 등록에 실패했습니다',
  },
} as const satisfies Record<string, Record<Locale, string>>;

export type AdminTextKey = keyof typeof ADMIN_TEXT;

/** 主催者 管理画面の固定文を言語で引く。 */
export function adminText(
  locale: Locale,
  key: AdminTextKey,
  params?: Record<string, string>,
): string {
  return lookup(ADMIN_TEXT, locale, key, params);
}
