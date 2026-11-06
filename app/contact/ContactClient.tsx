'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import './contact.css';

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    furigana: '',  // 追加
    phone: '',     // 追加
    email: '',
    company: '',
    category: '導入のご相談',
    message: '',
    website: '',   // ハニーポット用（Bot対策）
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. ハニーポットチェック（Botは全てのinputを埋めようとするため、これが埋まっていたら弾く）
    if (formData.website !== '') {
      alert('スパムの疑いがあるため、送信をブロックしました。');
      return;
    }

    // 2. 名前のバリデーション（漢字・ひらがな・カタカナのみ）
    const nameRegex = /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s]+$/;
    if (!nameRegex.test(formData.name)) {
      alert('お名前は日本語（漢字・ひらがな・カタカナ）で入力してください。');
      return;
    }

    // 3. フリガナのバリデーション（全角カタカナのみ）
    const furiganaRegex = /^[\u30A0-\u30FF\s]+$/;
    if (!furiganaRegex.test(formData.furigana)) {
      alert('フリガナは全角カタカナで入力してください。');
      return;
    }

    // 4. 電話番号のバリデーション（数字とハイフンのみ）
    const phoneRegex = /^[0-9-]{10,13}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('電話番号はハイフンありの10〜13桁で入力してください（例: 090-1234-5678）。');
      return;
    }

    // 5. お問い合わせ内容のバリデーション（日本語が含まれているか）
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
    if (!jpRegex.test(formData.message)) {
      alert('お問い合わせ内容は日本語で入力してください。');
      return;
    }

    setSending(true);

    try {
      // ※API側でも同じバリデーションをかけるのがセオリーです
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '送信に失敗しました');
        setSending(false);
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <nav className="c-nav">
        <div className="c-nav-inner">
          <BrandLogo />
          <Link href="/signup" className="c-nav-cta">今すぐ申し込む →</Link>
        </div>
      </nav>

      <main className="c-main">
        <div className="c-breadcrumb">
          <Link href="/">ホーム</Link>
          <span className="sep">/</span>
          <span className="current">お問い合わせ</span>
        </div>

        <div className="c-hero">
          <span className="c-badge">📩 Contact</span>
          <h1>お問い合わせ</h1>
          <p>
            導入のご相談、料金プラン、代理店プログラム、技術的なご質問など、<br />
            お気軽にお問い合わせください。
          </p>
        </div>

        <div className="c-content">

          {/* フォーム */}
          {submitted ? (
            <div className="c-success">
              <div className="c-success-icon">✅</div>
              <h2>お問い合わせを受け付けました</h2>
              <p>
                内容を確認の上、<strong>2〜3営業日以内</strong>にご返信いたします。<br />
                しばらくお待ちくださいませ。
              </p>
              <Link href="/" className="c-success-btn">ホームに戻る</Link>
            </div>
          ) : (
            <form className="c-form" onSubmit={handleSubmit}>
              <h2>お問い合わせフォーム</h2>

              {/* ハニーポット（スパム対策・ユーザーには見えない） */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="website">Webサイト（入力しないでください）</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="c-field">
                <label htmlFor="category">お問い合わせ種別 <span className="required">必須</span></label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="導入のご相談">導入のご相談</option>
                  <option value="料金プランについて">料金プランについて</option>
                  <option value="代理店プログラムについて">代理店プログラムについて</option>
                  <option value="技術的なご質問">技術的なご質問</option>
                  <option value="取材・メディア">取材・メディア</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div className="c-field-row">
                <div className="c-field">
                  <label htmlFor="name">お名前 <span className="required">必須</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="山田 太郎"
                    required
                  />
                </div>
                <div className="c-field">
                  <label htmlFor="furigana">フリガナ <span className="required">必須</span></label>
                  <input
                    type="text"
                    id="furigana"
                    name="furigana"
                    value={formData.furigana}
                    onChange={handleChange}
                    placeholder="ヤマダ タロウ"
                    required
                  />
                </div>
              </div>

              <div className="c-field-row">
                <div className="c-field">
                  <label htmlFor="company">会社名・店舗名</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="株式会社サンプル / Patisserie Taro"
                  />
                </div>
                <div className="c-field">
                  <label htmlFor="phone">電話番号 <span className="required">必須</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="090-1234-5678"
                    required
                  />
                </div>
              </div>

              <div className="c-field">
                <label htmlFor="email">メールアドレス <span className="required">必須</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="taro@example.com"
                  required
                />
              </div>

              <div className="c-field">
                <label htmlFor="message">お問い合わせ内容 <span className="required">必須</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="ご質問・ご相談内容をご記入ください"
                  rows={6}
                  required
                />
              </div>

              <button type="submit" className="c-submit" disabled={sending}>
                {sending ? '送信中...' : '送信する'}
                {!sending && <i className="fas fa-arrow-right"></i>}
              </button>

              <p className="c-note">
                ※ 2〜3営業日以内にご返信いたします。<br />
                ※ 迷惑メールフォルダもご確認ください。
              </p>
            </form>
          )}

          {/* よくある質問 */}
          <div className="c-faq-link">
            <h3>よくあるご質問</h3>
            <p>お問い合わせ前に、こちらもご確認ください。</p>
            <Link href="/#faq" className="c-faq-btn">
              FAQ を見る →
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
