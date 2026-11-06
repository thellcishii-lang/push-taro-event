// lib/pdf-generator.ts
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFFont, PDFPage } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const PAGE_SIZE: [number, number] = [595, 842]; // A4相当
const MARGIN_X = 50;
const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 50;

async function loadJapaneseFont(doc: PDFDocument) {
  const fontPath = path.join(process.cwd(), 'NotoSansCJKjp-Regular.otf');
  const fontBytes = fs.readFileSync(fontPath);
  doc.registerFontkit(fontkit);
  return doc.embedFont(fontBytes);
}

// 1行分の文字列を、指定幅に収まるよう改行位置で分割する（日本語には単語区切りがないため文字単位で判定）
function wrapLine(line: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (line === '') return [''];
  const wrapped: string[] = [];
  let current = '';
  for (const ch of line) {
    const candidate = current + ch;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current !== '') {
      wrapped.push(current);
      current = ch;
    } else {
      current = candidate;
    }
  }
  if (current !== '') wrapped.push(current);
  return wrapped;
}

interface PdfCursor {
  doc: PDFDocument;
  font: PDFFont;
  page: PDFPage;
  y: number;
  maxWidth: number;
}

function newPage(cursor: PdfCursor) {
  cursor.page = cursor.doc.addPage(PAGE_SIZE);
  cursor.y = PAGE_SIZE[1] - MARGIN_TOP;
}

function drawText(cursor: PdfCursor, text: string, size: number, options?: { gapAfter?: number }) {
  const lines = text.split('\n').flatMap((line) => wrapLine(line, cursor.font, size, cursor.maxWidth));
  const lineHeight = size * 1.6;

  for (const line of lines) {
    if (cursor.y < MARGIN_BOTTOM + lineHeight) {
      newPage(cursor);
    }
    cursor.page.drawText(line, { x: MARGIN_X, y: cursor.y, size, font: cursor.font });
    cursor.y -= lineHeight;
  }
  cursor.y -= options?.gapAfter ?? 0;
}

// ============================================================
// お申し込み内容確認書PDF
// ============================================================
export async function generateApplicationPDF(
  type: 'shop' | 'agency' | 'affiliate',
  data: any
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await loadJapaneseFont(doc);
  const page = doc.addPage(PAGE_SIZE);
  const cursor: PdfCursor = { doc, font, page, y: PAGE_SIZE[1] - MARGIN_TOP, maxWidth: PAGE_SIZE[0] - MARGIN_X * 2 };

  const titles: Record<typeof type, string> = {
    shop: 'Push-taro お申し込み内容確認書',
    agency: 'Push-taro 代理店 お申し込み内容確認書',
    affiliate: 'Push-taro アフィリエイト お申し込み内容確認書',
  };
  drawText(cursor, titles[type], 18, { gapAfter: 14 });
  drawText(cursor, `作成日: ${new Date().toLocaleDateString('ja-JP')}`, 10, { gapAfter: 16 });

  const items: Array<[string, string]> = [];

  if (type === 'shop') {
    items.push(
      ['会社名 / 屋号', data.companyName || ''],
      ['メールアドレス', data.email || ''],
      ['電話番号', data.phone || ''],
      ['住所', data.address || ''],
      ['選択プラン', data.plan ? String(data.plan).toUpperCase() : ''],
      ['インボイス番号', data.invoiceNumber || '未登録'],
    );
    if (data.plan === 'pro' && data.bankAccount) {
      items.push(
        ['金融機関名', data.bankAccount.bankName || ''],
        ['支店名', data.bankAccount.branchName || ''],
        ['口座種別', data.bankAccount.accountType === 'savings' ? '普通' : '当座'],
        ['口座番号', data.bankAccount.accountNumber || ''],
        ['口座名義', data.bankAccount.accountHolder || ''],
      );
    }
  } else if (type === 'agency') {
    items.push(
      ['事業形態', data.businessType === 'corporation' ? '法人' : '個人事業主'],
      ['会社名 / 屋号', data.companyName || ''],
      ['ご担当者様', data.ownerName || ''],
      ['メールアドレス', data.email || ''],
      ['電話番号', data.phone || ''],
      ['住所', data.address || ''],
      ['インボイス番号', data.invoiceNumber || '未登録'],
      ['金融機関名', data.bankAccount?.bankName || ''],
      ['支店名', data.bankAccount?.branchName || ''],
      ['口座種別', data.bankAccount?.accountType === 'savings' ? '普通' : '当座'],
      ['口座番号', data.bankAccount?.accountNumber || ''],
      ['口座名義', data.bankAccount?.accountHolder || ''],
    );
  } else {
    items.push(
      ['氏名', data.name || ''],
      ['メールアドレス', data.email || ''],
      ['電話番号', data.phone || ''],
      ['住所', data.address || ''],
      ['事業形態', data.businessType === 'corporation' ? '法人' : '個人'],
      ...(data.businessType === 'corporation' ? [['会社名', data.companyName || ''] as [string, string]] : []),
      ['インボイス番号', data.invoiceNumber || '未登録'],
      ['報酬タイプ', data.rewardType === 'recurring' ? '継続課金型（初年度8%・13ヶ月目以降5%還元）' : '一括報酬型'],
      ['金融機関名', data.bankAccount?.bankName || ''],
      ['支店名', data.bankAccount?.branchName || ''],
      ['口座種別', data.bankAccount?.accountType === 'savings' ? '普通' : '当座'],
      ['口座番号', data.bankAccount?.accountNumber || ''],
      ['口座名義', data.bankAccount?.accountHolder || ''],
    );
  }

  for (const [label, value] of items) {
    drawText(cursor, `${label}：${value}`, 12, { gapAfter: 4 });
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

// ============================================================
// 利用規約PDF
// ============================================================
const SHOP_TERMS = `この利用規約（以下、「本規約」といいます。）は、the合同会社（以下、「当社」といいます。）が提供するPush-taro（以下、「当サービス」といいます。）の利用条件を定めるものです。ご利用者様（以下、「ユーザー」といいます。）には、本規約に従って当サービスをご利用いただきます。

第1条（適用）
本規約は、ユーザーと当社との間の当サービスの利用に関わる一切の関係に適用されるものとします。ユーザーが本サービスのお申し込みまたはご利用を開始した時点で、本規約の全条項に同意したものとみなします。

第2条（アカウント登録と管理）
1. ユーザーは、真実かつ正確な情報をもってアカウント登録を行うものとします。登録内容に変更が生じた場合、速やかに変更手続きを行う必要があります。
2. ユーザーは、自己の責任においてアカウントIDおよびパスワードを厳重に管理するものとし、第三者への譲渡・貸与・売買等はできません。
3. アカウント情報の管理不十分による損害の責任はユーザーが負うものとします。

第3条（利用料金および支払い方法）
1. ユーザーは、当サービスが定める各プラン（ライトプラン: 1,980円/月、スタンダードプラン: 3,800円/月、プロプラン: 10,000円/月、いずれも税別）の利用料金を、当社指定の決済手段（Square等）により支払うものとします。
2. 月の途中でアカウントの開通または解約が行われた場合であっても、日割り計算による返金・精算は行いません。
3. ユーザーが利用料金の支払いを遅延した場合、年14.6%の割合による遅延損害金を支払うものとします。

第4条（送信メッセージおよびコンテンツの責任）
1. 当サービスを通じてエンドユーザー（通知購読者）へ配信されるメッセージの内容（テキスト、画像、URL等）に関する責任は、一切ユーザー自身に帰属します。
2. ユーザーは、特定電子メール法等の関連法令、消費者庁ガイドラインおよびプライバシー関連法規を遵守し、承諾を得ていない不特定多数への迷惑通知（スパム配信）を行ってはなりません。

第5条（禁止事項）
ユーザーは、当サービスの利用にあたり、以下の行為を行ってはならないものとします。
・法令または公序良俗に違反する行為、あるいは犯罪行為に関連する行為
・当サービス、他のユーザー、または第三者の知的財産権、名誉、プライバシーを侵害する行為
・当サービスのサーバーやネットワークに過度な負荷をかける行為、リバースエンジニアリング等の解析行為
・虚偽の情報または第三者の情報を騙って配信を行う行為
・反社会的勢力への利益供与行為

第6条（サービスの提供停止・変更・終了）
1. 当社は、システムの定期保守・障害復旧・天災地変等の不可抗力により、事前に通知することなくサービスの全部または一部の提供を中断・停止することがあります。
2. 当社は、事前にお客様へ通知（Webサイト上での告知等）を行うことにより、当サービスの内容を変更し、または提供を終了することができるものとします。

第7条（紹介成果報酬制度・PRO特典）
1. プロプランをご契約のユーザーが他店舗を紹介した場合、所定のロジックに基づき10%相当の成果報酬権利が発生します。
2. 発生した成果報酬は、原則として毎月の請求精算時における自動控除・相殺にて精算されます。
3. 不正な自己紹介、虚偽アカウントの作成、その他不当な方法による成果報酬の発生が発覚した場合、当社は即時に報酬支払いを取消し、アカウントを停止することができます。

第8条（契約解除および利用制限）
ユーザーが本規約のいずれかの条項に違反した場合、または利用料金の支払いを怠った場合、当社は事前の催告なく即座にサービス利用の停止、あるいは契約を解除することができます。

第9条（免責事項）
1. 当社は、当サービスがユーザーの特定の目的に適合すること、期待する成果（集客数・売上向上等）が得られることを保証するものではありません。
2. ブラウザ端末（iOS/Android/Chrome等）の仕様変更、通信事業者の障害等によりプッシュ通知が正常に不着となった場合、当社はそれにより生じた損害について責任を負いません。
3. 当社が損害賠償責任を負う場合であっても、過去1ヶ月間にユーザーが支払った利用料相当額を上限とします。

第10条（秘密保持および個人情報の取扱い）
ユーザーおよび当社は、本サービスの提供・利用に関して知り得た相手方の非公表の情報を秘密に保持するものとします。個人情報の取扱いについては、別途定める「プライバシーポリシー」に従うものとします。

第11条（規約の変更）
当社は、必要と判断した場合には、ユーザーに事前に適切な方法（Webサイト上の掲示等）で通知することにより、いつでも本規約を変更することができるものとします。変更後の規約は掲載された時点で効力を生じます。

第12条（準拠法および裁判管轄）
本規約の解釈にあたっては、日本法を準拠法とします。当サービスに関して紛争が生じた場合、当社の本社所在地を管轄する裁判所を専属的合意管轄とします。

【サービス運営事業者】
事業者名：the合同会社
所在地：〒357-0123 埼玉県飯能市中藤下郷２３−２１
お問い合わせ：info@push-taro.com`;

const AGENCY_TERMS = `第1条（総則および目的）
本規約は、Push-taro（以下「当社」）が提供するLINE風Web Push通知・クーポンアプリサービス（以下「本サービス」）の販売パートナー（以下「代理店」）との間の権利義務関係および取扱い条件を定めるものです。

第2条（契約の成立）
代理店希望者が本申込みフォームより申請を行い、当社の審査を通過した上で、加盟金および初月代理店月額費用の決済を完了した時点で本契約が成立します。

第3条（加盟金および月額費用）
1. 代理店は加盟金（初期費用）として 300,000円（税別）を支払うものとします。
2. 代理店は月額システム利用・管理費として 30,000円/月（税別）を毎月当社に支払うものとします。

第4条（成果報酬の支払い・相殺管理）
1. 当社は、代理店の紹介コードを経由して契約・維持されているアクティブな店舗（顧客）数に応じて、所定の還元率に基づく紹介報酬を算定します。
2. 発生した紹介報酬は、毎月末日締め・翌月末日払いとし、代理店が指定する銀行口座へ振込にてお支払いします。
3. 代理店月額費用は、当社指定の決済手段（Square等）により別途お支払いいただくものとし、紹介報酬との相殺は行いません。

第5条（返金不能）
決済完了後、理由の如何（審査後の自己都合キャンセル、中途解約など）を問わず、既にお支払いいただいた加盟金および月額費用の返金には応じかねます。

第6条（禁止事項）
代理店は以下の行為を行ってはなりません。
① 当社の事前許可を得ない虚偽・誇大広告による勧誘
② 不正な紹介コードの複製、第三者への譲渡または二次貸与
③ 当社または第三者の著作権・商標権・信用を毀損する行為

第7条（秘密保持）
代理店は、本事業に関して知り得た当社の営業上・技術上および顧客に関する情報を、事前の書面による承諾なく第三者に漏洩してはなりません。

第8条（反社会的な勢力の排除）
代理店は、自らまたはその役員が暴力団、暴力団関係企業、総会屋等の反社会勢力に該当しないことを表明し、保証するものとします。

第9条（契約解除）
代理店が本規約に違反した場合、または月額費用等の支払いを怠った場合、当社は事前の催告なく即座に代理店契約を解除し、紹介報酬の支払いを停止することができます。

第10条（管轄裁判所）
本規約に関して紛争が生じた場合、当社の本社所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。

【サービス運営事業者】
事業者名：the合同会社
所在地：〒357-0123 埼玉県飯能市中藤下郷２３−２１
お問い合わせ：info@push-taro.com`;

const AFFILIATE_TERMS = `1. アフィリエイトプログラムはPush-taroの収益化プログラムの一部です。
2. 報酬は紹介した店舗のプランに応じて計算されます。
3. 不正な紹介行為が発覚した場合、報酬は無効となりアカウントは停止されます。
4. 報酬は月末締め・翌月払いです。
5. 報酬タイプ（継続課金型／一括報酬型）は申込み後に変更できません。
6. 本規約は予告なく変更されることがあります。

詳細な共通利用規約は Push-taro 利用規約（/terms）をあわせてご確認ください。

【サービス運営事業者】
事業者名：the合同会社
所在地：〒357-0123 埼玉県飯能市中藤下郷２３−２１
お問い合わせ：info@push-taro.com`;

const TERMS_TITLES: Record<'shop' | 'agency' | 'affiliate', string> = {
  shop: 'Push-taro 利用規約',
  agency: 'Push-taro 代理店利用規約',
  affiliate: 'Push-taro アフィリエイト利用規約',
};

const TERMS_BODIES: Record<'shop' | 'agency' | 'affiliate', string> = {
  shop: SHOP_TERMS,
  agency: AGENCY_TERMS,
  affiliate: AFFILIATE_TERMS,
};

export async function generateTermsPDF(type: 'shop' | 'agency' | 'affiliate'): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await loadJapaneseFont(doc);
  const page = doc.addPage(PAGE_SIZE);
  const cursor: PdfCursor = { doc, font, page, y: PAGE_SIZE[1] - MARGIN_TOP, maxWidth: PAGE_SIZE[0] - MARGIN_X * 2 };

  drawText(cursor, TERMS_TITLES[type], 18, { gapAfter: 16 });
  drawText(cursor, TERMS_BODIES[type], 11, {});

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
