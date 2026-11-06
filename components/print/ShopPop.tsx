import type { ShopPopData } from '@/lib/print/types';
import QRBlock from './QRBlock';

interface Props {
  data: ShopPopData;
  size: 'a4' | 'b5'; // 👈 B5に完全対応
}

export default function ShopPop({ data, size }: Props) {
  const { shopName, subscribeUrl, firstCoupon } = data;

  const showPerk = firstCoupon?.enabled === true;
  const perkTitle = firstCoupon?.title || '初回限定クーポン';
  const perkDesc = firstCoupon?.description || '';

  return (
    <section className={`p-page shop-pop shop-pop--${size}`}>
      <h1 className="shop-pop-name">{shopName}</h1>

      <div className="shop-pop-mid">
        <div className="shop-pop-lead">＼ スマホで読み取るだけ ／</div>
        <h2 className="shop-pop-catch">
          お得な情報を<br />
          <span className="accent">プッシュ通知</span>で<br />
          お届けします
        </h2>

        <div className="shop-pop-qr">
          <QRBlock value={subscribeUrl} size={size === 'a4' ? 285 : 200} />
        </div>
      </div>

      {showPerk && (
        <div className="shop-pop-perk">
          <span className="shop-pop-perk-badge">初回限定</span>
          <div className="shop-pop-perk-title">🎁 {perkTitle}</div>
          {perkDesc && <div className="shop-pop-perk-desc">{perkDesc}</div>}
        </div>
      )}

      <style jsx global>{`
        .shop-pop {
          background: #fff;
          position: relative;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          font-family: -apple-system, BlinkMacSystemFont, "Noto Sans JP", sans-serif;
          color: #0f172a;
          box-sizing: border-box;
          border: 0.6mm solid #0f172a;
          overflow: hidden;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .shop-pop * { box-sizing: border-box; }
        
        .shop-pop--a4 {
          width: 210mm; height: 297mm; padding: 18mm 16mm; page: page-a4v;
        }
        /* 👇 B5のサイズ設定 */
        .shop-pop--b5 {
          width: 182mm; height: 257mm; padding: 12mm 12mm 10mm; page: page-b5v;
        }

        .shop-pop-name {
          font-weight: 900; letter-spacing: -0.02em; line-height: 1.25;
          text-align: center; padding-bottom: 6mm; border-bottom: 0.4mm solid #e2e8f0;
          margin: 0; flex-shrink: 0;
        }
        .shop-pop--a4 .shop-pop-name { font-size: 26pt; }
        .shop-pop--b5 .shop-pop-name { font-size: 18pt; padding-bottom: 5mm; }

        .shop-pop-mid {
          flex: 1; display: flex; flex-direction: column; justify-content: center;
          align-items: center; text-align: center; padding: 6mm 0; min-height: 0;
        }
        .shop-pop--b5 .shop-pop-mid { padding: 5mm 0; }

        .shop-pop-lead {
          display: inline-block; background: #0f172a; color: #fff; font-weight: 900;
          border-radius: 20mm; padding: 1.8mm 6mm; margin-bottom: 6mm; white-space: nowrap;
        }
        .shop-pop--a4 .shop-pop-lead { font-size: 12pt; }
        .shop-pop--b5 .shop-pop-lead { font-size: 10pt; padding: 1.5mm 5mm; margin-bottom: 4mm; }

        .shop-pop-catch { font-weight: 900; line-height: 1.3; margin: 0 0 8mm; }
        .shop-pop--a4 .shop-pop-catch { font-size: 30pt; }
        .shop-pop--b5 .shop-pop-catch { font-size: 22pt; margin-bottom: 6mm; }
        .shop-pop-catch .accent { color: #ff4500; }

        .shop-pop-qr {
          padding: 5mm; background: #fff; border: 0.5mm solid #e2e8f0;
          border-radius: 3mm; display: inline-flex; line-height: 0;
        }
        .shop-pop--b5 .shop-pop-qr { padding: 4mm; }

        .shop-pop-perk {
          margin-top: 6mm; padding: 5mm 6mm; background: #fff7ed;
          border: 0.6mm dashed #ff4500; border-radius: 3mm; text-align: center; flex-shrink: 0;
        }
        .shop-pop--b5 .shop-pop-perk { margin-top: 5mm; padding: 4mm 5mm; }

        .shop-pop-perk-badge {
          display: inline-block; background: #ff4500; color: #fff; font-weight: 900;
          border-radius: 2mm; padding: 1mm 3.5mm; margin-bottom: 2.5mm;
        }
        .shop-pop--b5 .shop-pop-perk-badge { font-size: 8pt; padding: 0.8mm 3mm; margin-bottom: 2mm; }

        .shop-pop-perk-title { color: #c2410c; font-weight: 900; line-height: 1.3; }
        .shop-pop--a4 .shop-pop-perk-title { font-size: 20pt; }
        .shop-pop--b5 .shop-pop-perk-title { font-size: 16pt; }

        .shop-pop-perk-desc { color: #7c2d12; margin-top: 2mm; font-weight: 700; line-height: 1.5; }
        .shop-pop--a4 .shop-pop-perk-desc { font-size: 10pt; }
        .shop-pop--b5 .shop-pop-perk-desc { font-size: 9pt; margin-top: 1.5mm; }

        @media print {
          .shop-pop { box-shadow: none; }
          .shop-pop--a4 { padding: 18mm 16mm !important; }
          .shop-pop--b5 { padding: 12mm 12mm 10mm !important; }
        }
      `}</style>
    </section>
  );
}
