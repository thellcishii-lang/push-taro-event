'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import '../print.css';

type TermsType = 'shop' | 'pro-shop' | 'affiliate' | 'affilishop' | 'agency';

interface Article {
  title: string;
  body?: string[];
  list?: string[];
}

interface TermsDef {
  title: string;
  subtitle: string;
  articles: Article[];
}

/* ============================================================
   共通 12条
   ============================================================ */

const A1: Article = {
  title: '第1条（適用）',
  body: [
    '本規約は、the合同会社（以下「当社」）が提供するPush-taro（以下「本サービス」）の利用条件を定めるものです。ユーザーは、本規約に従って本サービスをご利用いただきます。',
    'ユーザーが本サービスのお申し込みまたはご利用を開始した時点で、本規約の全条項に同意したものとみなします。',
  ],
};

const A2: Article = {
  title: '第2条（アカウント登録と管理）',
  body: [
    'ユーザーは、真実かつ正確な情報をもってアカウント登録を行うものとします。登録内容に変更が生じた場合、速やかに変更手続きを行う必要があります。',
    'ユーザーは、自己の責任においてアカウントIDおよびパスワードを厳重に管理するものとし、第三者への譲渡・貸与・売買等はできません。',
    'アカウント情報の管理不十分による損害の責任はユーザーが負うものとします。',
  ],
};

const A3: Article = {
  title: '第3条（料金および支払い方法）',
  body: [
    'ユーザーは、当社が定める料金を、当社指定の決済手段（Square等）により支払うものとします。',
    '月の途中でアカウントの開通または解約が行われた場合であっても、日割り計算による返金・精算は行いません。',
    'ユーザーが料金の支払いを遅延した場合、年14.6%の割合による遅延損害金を支払うものとします。',
  ],
};

const A4: Article = {
  title: '第4条（送信メッセージおよびコンテンツの責任）',
  body: [
    '本サービスを通じてエンドユーザー（通知購読者）へ配信されるメッセージの内容（テキスト、画像、URL等）に関する責任は、一切ユーザー自身に帰属します。',
    'ユーザーは、特定電子メール法等の関連法令、消費者庁ガイドラインおよびプライバシー関連法規を遵守し、承諾を得ていない不特定多数への迷惑通知（スパム配信）を行ってはなりません。',
  ],
};

const A5: Article = {
  title: '第5条（禁止事項）',
  body: ['ユーザーは、本サービスの利用にあたり、以下の行為を行ってはならないものとします。'],
  list: [
    '法令または公序良俗に違反する行為、あるいは犯罪行為に関連する行為',
    '当社、他のユーザー、または第三者の知的財産権、名誉、プライバシーを侵害する行為',
    '本サービスのサーバーやネットワークに過度な負荷をかける行為、リバースエンジニアリング等の解析行為',
    '虚偽の情報または第三者の情報を騙って配信を行う行為',
    '反社会的勢力への利益供与行為',
  ],
};

const A6: Article = {
  title: '第6条（サービスの提供停止・変更・終了）',
  body: [
    '当社は、システムの定期保守・障害復旧・天災地変等の不可抗力により、事前に通知することなく本サービスの全部または一部の提供を中断・停止することがあります。',
    '当社は、事前にユーザーへ通知（Webサイト上での告知等）を行うことにより、本サービスの内容を変更し、または提供を終了することができるものとします。',
  ],
};

const A7: Article = {
  title: '第7条（契約解除および利用制限）',
  body: [
    'ユーザーが本規約のいずれかの条項に違反した場合、または料金の支払いを怠った場合、当社は事前の催告なく即座に本サービス利用の停止、あるいは契約を解除することができます。',
  ],
};

const A8: Article = {
  title: '第8条（免責事項）',
  body: [
    '当社は、本サービスがユーザーの特定の目的に適合すること、期待する成果（集客数・売上向上等）が得られることを保証するものではありません。',
    'ブラウザ端末（iOS/Android/Chrome等）の仕様変更、通信事業者の障害等によりプッシュ通知が正常に不着となった場合、当社はそれにより生じた損害について責任を負いません。',
    '当社が損害賠償責任を負う場合であっても、過去1ヶ月間にユーザーが支払った利用料相当額を上限とします。',
  ],
};

const A9: Article = {
  title: '第9条（秘密保持および個人情報の取扱い）',
  body: [
    'ユーザーおよび当社は、本サービスの提供・利用に関して知り得た相手方の非公表の情報を秘密に保持するものとします。個人情報の取扱いについては、別途定める「プライバシーポリシー」に従うものとします。',
  ],
};

const A10: Article = {
  title: '第10条（反社会的勢力の排除）',
  body: [
    'ユーザーおよび当社は、自らまたはその役員が暴力団、暴力団関係企業、総会屋等の反社会的勢力に該当しないことを表明し、保証するものとします。',
  ],
};

const A11: Article = {
  title: '第11条（規約の変更）',
  body: [
    '当社は、必要と判断した場合には、ユーザーに事前に適切な方法（Webサイト上の掲示等）で通知することにより、いつでも本規約を変更することができるものとします。変更後の規約は掲載された時点で効力を生じます。',
  ],
};

const A12: Article = {
  title: '第12条（準拠法および裁判管轄）',
  body: [
    '本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合、当社の本社所在地を管轄する裁判所を専属的合意管轄とします。',
  ],
};

/* ============================================================
   種別ごとの特約（第13条）
   ============================================================ */

const SPECIAL_SHOP: Article = {
  title: '第13条（店舗プラン特約）',
  body: [
    '本サービスは、ライトプラン（1,980円/月・税別）、スタンダードプラン（3,800円/月・税別）、プロプラン（10,000円/月・税別）の3プランを提供します。',
    'ライトプランおよびスタンダードプランには、月間の配信数上限があります（ライト: 5,000通、スタンダード: 15,000通）。上限を超過した場合、翌月まで送信が制限されますが、追加課金は発生しません。',
    'プロプランは配信無制限です。追加の従量課金は一切ありません。',
    '月額費用は税別表示であり、別途消費税が加算されます。',
  ],
};

const SPECIAL_PRO: Article = {
  title: '第13条（プロプラン特約 - 紹介報酬制度）',
  body: [
    'プロプランをご契約中のユーザーが他店舗を紹介した場合、紹介した店舗の契約プランにかかわらず、月額料金の10%相当の成果報酬権利が発生します。',
    '発生した成果報酬は、原則として毎月の請求精算時における自動控除・相殺にて精算されます。',
    '紹介店舗が契約を継続する限り、報酬は毎月発生します。10件の紹介でプロプランの月額（税別10,000円）が実質無料となります。',
    '累計1万円以上でご指定の銀行口座への振込申請が可能です。',
    '不正な自己紹介、虚偽アカウントの作成、その他不当な方法による成果報酬の発生が発覚した場合、当社は即時に報酬支払いを取消し、アカウントを停止することができます。',
  ],
};

const SPECIAL_AFFILIATE: Article = {
  title: '第13条（アフィリエイト報酬特約）',
  body: [
    'アフィリエイトは、以下のいずれかの報酬タイプを登録時に選択するものとします。登録後の変更はできません。',
    '【継続課金型】紹介した店舗の契約が継続する限り、月額料金の初年度8%・13ヶ月目以降5%相当の報酬が毎月発生します。',
    '【一括報酬型】紹介した店舗の契約成立時に、プランに応じて以下の一括報酬が発生します。プロプラン: 5,000円 / スタンダードプラン: 2,000円 / ライトプラン: 1,000円（いずれも税別）。',
    '報酬は毎月末日締め・翌月末日払いとし、累計5,000円以上でご指定の銀行口座への振込申請が可能です。',
    'インボイス登録がない場合、報酬支払い時に10%が源泉徴収されます。',
    '不正な自己紹介、虚偽アカウントの作成、その他不当な方法による報酬の発生が発覚した場合、当社は即時に報酬支払いを取消し、アカウントを停止することができます。',
  ],
};

const SPECIAL_AFFILISHOP: Article = {
  title: '第13条（affilishop特約）',
  body: [
    'affilishopプログラムの審査を通過したユーザーは、本特約に基づき成果報酬を受け取ることができます。',
    '報酬は、紹介コード経由で契約された店舗の月額料金に対し、全プラン一律で初年度10%・13ヶ月目以降7%相当とします。',
    '報酬は毎月末日締め・翌月末日払いとし、累計5,000円以上でご指定の銀行口座への振込申請が可能です。',
    '直近3ヶ月間の紹介実績が0件の場合、当社は事前の通知をもって自動的に契約を終了することができます。',
    '不正な自己紹介、虚偽アカウントの作成、その他不当な方法による報酬の発生が発覚した場合、当社は即時に報酬支払いを取消し、アカウントを停止することができます。',
  ],
};

const SPECIAL_AGENCY: Article = {
  title: '第13条（代理店特約）',
  body: [
    '代理店契約の成立には、加盟金（初期費用）300,000円（税別）および月額費用30,000円/月（税別）のお支払いが必要です。',
    '決済完了後、理由の如何（審査後の自己都合キャンセル、中途解約など）を問わず、既にお支払いいただいた加盟金および月額費用の返金には応じかねます。',
    '当社は、代理店の紹介コードを経由して契約・維持されているアクティブな店舗数に応じて、以下の還元率で紹介報酬を算定します。',
    '【プロプラン契約店舗】紹介件数 1〜100件: 30% ／ 101件〜200件: 36% ／ 201件以上: 45%',
    '【ライト・スタンダードプラン契約店舗】紹介件数にかかわらず、常に一律 18%',
    '紹介報酬は、毎月末日締め・翌月末日払いとし、代理店が指定する銀行口座へ振込にてお支払いします。',
    '代理店月額費用は、当社指定の決済手段により別途お支払いいただくものとし、紹介報酬との相殺は行いません。',
  ],
};

/* ============================================================
   型定義と設定
   ============================================================ */

const TYPE_CONFIG: Record<TermsType, { title: string; subtitle: string; special: Article }> = {
  shop: {
    title: '店舗利用規約',
    subtitle: 'Push-taro 店舗向けサービス（LIGHT / STANDARD）',
    special: SPECIAL_SHOP,
  },
  'pro-shop': {
    title: '店舗利用規約（プロプラン）',
    subtitle: 'Push-taro 店舗向けサービス / PRO',
    special: SPECIAL_PRO,
  },
  affiliate: {
    title: 'アフィリエイト利用規約',
    subtitle: 'Push-taro Partner Program / Affiliate',
    special: SPECIAL_AFFILIATE,
  },
  affilishop: {
    title: 'affilishop利用規約',
    subtitle: 'Push-taro Partner Program / affilishop',
    special: SPECIAL_AFFILISHOP,
  },
  agency: {
    title: '代理店利用規約',
    subtitle: 'Push-taro Authorized Agency Program',
    special: SPECIAL_AGENCY,
  },
};

function buildTerms(type: TermsType): TermsDef {
  const config = TYPE_CONFIG[type];
  return {
    title: config.title,
    subtitle: config.subtitle,
    articles: [A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12, config.special],
  };
}

/* ============================================================
   本体
   ============================================================ */

function TermsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = (searchParams.get('type') || 'shop') as TermsType;
  const type: TermsType = TYPE_CONFIG[typeParam] ? typeParam : 'shop';
  const terms = buildTerms(type);

  useEffect(() => {
    document.title = `${terms.title} | Push-taro`;
    return () => {
      document.title = 'Push-taro';
    };
  }, [terms.title]);

  return (
    <>
      <div className="print-toolbar no-print">
        <div className="print-toolbar-info">
          <strong>{terms.title}</strong>
          <span>{terms.subtitle}</span>
        </div>
        <div className="print-toolbar-actions">
          <button className="primary" onClick={() => window.print()}>
            🖨️ 印刷 / PDF保存
          </button>
        </div>
      </div>

      <div className="print-doc">
        <div className="terms-page">
          <h1 className="terms-title">{terms.title}</h1>
          <p className="terms-subtitle">{terms.subtitle}</p>

          {terms.articles.map((a, i) => (
            <section key={i} className="terms-article">
              <h2>{a.title}</h2>
              {a.body?.map((p, j) => <p key={j}>{p}</p>)}
              {a.list && (
                <ul>
                  {a.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}

          <div className="terms-operator">
            <p className="terms-operator-title">【サービス運営事業者】</p>
            <p>事業者名：the合同会社</p>
            <p>所在地：〒357-0123 埼玉県飯能市中藤下郷２３−２１</p>
            <p>お問い合わせ：info@push-taro.com</p>
          </div>

          <footer className="terms-footer">© 2026 Push-taro All Rights Reserved.</footer>
        </div>
      </div>

      <style jsx global>{`
        /* ============================================================
           規約ページ本体
           ============================================================ */
        .terms-page {
          width: 210mm;
          min-height: 297mm;
          background: #fff;
          padding: 18mm 20mm;
          box-sizing: border-box;
          color: #1a202c;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif;
          font-size: 10pt;
          line-height: 1.8;
          position: relative;
        }

        .terms-title {
          font-size: 20pt;
          font-weight: 900;
          text-align: center;
          letter-spacing: 2px;
          margin: 0 0 6px;
          color: #0f172a;
        }
        .terms-subtitle {
          font-size: 9pt;
          color: #64748b;
          text-align: center;
          margin: 0 0 32px;
          font-weight: 700;
        }

        .terms-article {
          margin-bottom: 16px;
        }
        .terms-article h2 {
          font-size: 11pt;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid #fed7aa;
        }
        .terms-article p {
          font-size: 9.5pt;
          line-height: 1.85;
          color: #334155;
          margin: 0 0 6px;
        }
        .terms-article p:last-child {
          margin-bottom: 0;
        }
        .terms-article ul {
          list-style: none;
          padding: 0;
          margin: 6px 0 0;
        }
        .terms-article ul li {
          font-size: 9.5pt;
          line-height: 1.85;
          color: #334155;
          padding-left: 18px;
          position: relative;
          margin-bottom: 4px;
        }
        .terms-article ul li::before {
          content: '・';
          position: absolute;
          left: 4px;
          color: #ff4500;
          font-weight: 900;
        }

        .terms-operator {
          margin-top: 48px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          font-size: 9pt;
          color: #475569;
        }
        .terms-operator-title {
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px;
        }
        .terms-operator p {
          margin: 0 0 3px;
        }

        .terms-footer {
          margin-top: 40px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 8pt;
          color: #94a3b8;
        }

        @media print {
          @page { size: A4; margin: 0; }
          .terms-page {
            box-shadow: none;
            padding: 18mm 20mm;
          }
        }
      `}</style>
    </>
  );
}

export default function PrintTermsPage() {
  
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
          読み込み中...
        </div>
      }
    >
      <TermsContent />
    </Suspense>
  );
}
