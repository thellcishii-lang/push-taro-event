'use client';

// app/e/[eventId]/page.tsx
// Push-taro EVENT の来場者登録画面（QRコードの着地先）。
// 流れ: イベント情報の確認 → 電話番号のSMS認証 → 通知許可とFCMトークン取得 → 登録API。
// 電話番号認証の作法は本家の登録画面（app/subscribe）に合わせている。
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  User,
  onAuthStateChanged,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth, requestFCMToken } from '@/lib/firebase-client';

interface PublicEvent {
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'live' | 'ended';
  resetMode: 'full-daily' | 'keep-phones';
}

type Phase =
  | 'loading'
  | 'not-found'
  | 'unavailable'
  | 'phone'
  | 'code'
  | 'register'
  | 'done';

function normalizePhoneNumber(value: string): string {
  const compact = value
    .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
    .replace(/[\s().-]/g, '');
  if (compact.startsWith('00')) return `+${compact.slice(2)}`;
  if (compact.startsWith('0')) return `+81${compact.slice(1)}`;
  if (compact.startsWith('81')) return `+${compact}`;
  return compact;
}

const containerStyle: React.CSSProperties = {
  padding: 24,
  maxWidth: 480,
  margin: '0 auto',
  fontFamily: 'sans-serif',
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  marginTop: 6,
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: 16,
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 20px',
  fontWeight: 700,
  fontSize: 15,
  width: '100%',
  marginTop: 16,
};

export default function EventVisitorPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/public`);
        if (!res.ok) {
          if (!cancelled) setPhase('not-found');
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const ev = data.event as PublicEvent;
        setEvent(ev);
        setPhase(ev.status === 'live' ? 'phone' : 'unavailable');
      } catch {
        if (!cancelled) setPhase('not-found');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) setPhase((p) => (p === 'phone' || p === 'code' ? 'register' : p));
      }),
    [],
  );

  const handleSendCode = async () => {
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setMessage('電話番号は09012345678、または+819012345678の形式で入力してください。');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const previousVerifier = (window as unknown as Record<string, unknown>)
        .__phoneRecaptchaVerifier as RecaptchaVerifier | undefined;
      previousVerifier?.clear();
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'normal' });
      (window as unknown as Record<string, unknown>).__phoneRecaptchaVerifier = verifier;
      const result = await signInWithPhoneNumber(auth, normalized, verifier);
      setConfirmationResult(result);
      setPhase('code');
      setMessage('SMSで届いた認証コードを入力してください。');
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown';
      setMessage(`認証コードの送信に失敗しました（${code}）。`);
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!confirmationResult || !verificationCode.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      await confirmationResult.confirm(verificationCode.trim());
      setConfirmationResult(null);
      setPhase('register');
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown';
      setMessage(`認証コードが正しくありません（${code}）。`);
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!user || !event) return;
    setBusy(true);
    setMessage('');
    try {
      // iPhone はホーム画面に追加した状態でないと Web Push を受け取れない（本家と同じ案内）
      const isStandalone =
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;
      const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
      if (isIos && !isStandalone) {
        setMessage(
          'iPhoneでは通知の受け取りに「ホーム画面に追加」が必要です。\n\n1. Safari下部の「共有ボタン」をタップ\n2. 「ホーム画面に追加」を選択\n3. ホーム画面に作成されたアイコンから開いて、もう一度登録してください。',
        );
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage('通知が許可されませんでした。ブラウザの設定で通知を許可してください。');
        return;
      }
      const fcmToken = await requestFCMToken({ shopName: event.name });
      if (!fcmToken) {
        setMessage('通知トークンの取得に失敗しました。対応ブラウザでお試しください。');
        return;
      }

      const idToken = await user.getIdToken();
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ fcmToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? '登録に失敗しました。');
        return;
      }
      setPhase('done');
    } catch {
      setMessage('登録に失敗しました。通信環境を確認してもう一度お試しください。');
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'loading') return <main style={containerStyle}>読み込み中…</main>;
  if (phase === 'not-found') {
    return (
      <main style={containerStyle}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>イベントが見つかりません</h1>
        <p style={{ fontSize: 14 }}>QRコードをもう一度読み取ってください。</p>
      </main>
    );
  }
  if (!event) return <main style={containerStyle}>読み込み中…</main>;

  return (
    <main style={containerStyle}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>{event.name}</h1>
      <p style={{ fontSize: 13, color: '#475569' }}>
        開催期間: {event.startDate} 〜 {event.endDate}
      </p>

      {phase === 'unavailable' && (
        <p style={{ fontSize: 15, marginTop: 24 }}>
          {event.status === 'ended'
            ? 'このイベントは終了しました。'
            : 'このイベントは現在、登録を受け付けていません。'}
        </p>
      )}

      {phase === 'phone' && (
        <section style={{ marginTop: 24 }}>
          <p style={{ fontSize: 14 }}>
            会場からのお知らせとクーポンを受け取るには、電話番号で登録してください。
          </p>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
            電話番号
            <input
              style={inputStyle}
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="09012345678"
            />
          </label>
          <div id="recaptcha-container" style={{ marginTop: 12 }} />
          <button style={buttonStyle} onClick={handleSendCode} disabled={busy}>
            SMSで認証コードを送る
          </button>
        </section>
      )}

      {phase === 'code' && (
        <section style={{ marginTop: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>
            認証コード
            <input
              style={inputStyle}
              type="text"
              inputMode="numeric"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="6桁のコード"
            />
          </label>
          <button style={buttonStyle} onClick={handleConfirmCode} disabled={busy}>
            認証する
          </button>
        </section>
      )}

      {phase === 'register' && (
        <section style={{ marginTop: 24 }}>
          <p style={{ fontSize: 14 }}>
            電話番号の認証が完了しました。最後に通知の許可をしてください。
          </p>
          <button style={buttonStyle} onClick={handleRegister} disabled={busy}>
            通知を登録する
          </button>
        </section>
      )}

      {phase === 'done' && (
        <section style={{ marginTop: 24 }}>
          <p style={{ fontSize: 17, fontWeight: 700 }}>登録が完了しました</p>
          <p style={{ fontSize: 14, marginTop: 12 }}>
            通知登録は毎日リセットされます。翌日も通知を受け取るには、もう一度このページから登録してください。
          </p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            {event.resetMode === 'keep-phones'
              ? '電話番号とクーポンの取得・利用記録は会期中保持され、イベント終了時に消去されます。'
              : '電話番号も含め、登録情報は毎日すべて消去されます。'}
          </p>
        </section>
      )}

      {message && (
        <p style={{ marginTop: 16, fontSize: 14, color: '#b91c1c', whiteSpace: 'pre-wrap' }}>{message}</p>
      )}
    </main>
  );
}
