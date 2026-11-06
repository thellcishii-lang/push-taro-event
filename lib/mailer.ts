// lib/mailer.ts
import nodemailer from 'nodemailer';
import sanitizeHtml from 'sanitize-html';

const infoMailUser = process.env.INFOMAIL_USER?.trim();
const infoMailPass = process.env.INFOMAIL_PASS?.trim();
const fromAddress = 'info@push-taro.com';
const companyFooter = `
  <hr />
  <p><strong>Push-taro.com</strong></p>
  <p>運営会社：the合同会社</p>
  <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
  <p><a href="mailto:${fromAddress}">${fromAddress}</a></p>
`;

const transporter = infoMailUser && infoMailPass
  ? nodemailer.createTransport({
      host: 'smtp.zoho.jp',
      port: 465,
      secure: true,
      auth: {
        user: infoMailUser,
        pass: infoMailPass,
      },
    })
  : null;

export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'div', 'span', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'img',
    ],
    allowedAttributes: {
      '*': ['style'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  });
}

function addCompanyFooter(html: string): string {
  return html.includes('中藤下郷') ? html : `${html}${companyFooter}`;
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}) {
  if (!transporter || !infoMailUser || !infoMailPass) {
    const errorMessage = 'メール送信は未設定です。INFOMAIL_USER と INFOMAIL_PASS を環境変数に設定してください。';
    console.error('[Mailer]', errorMessage);
    return { success: false, error: errorMessage };
  }

  try {
    const info = await transporter.sendMail({
      from: `Push-taro <${fromAddress}>`,
      to,
      subject,
      html: sanitizeEmailHtml(addCompanyFooter(html)),
      attachments,
    });
    console.log('[Mailer] メール送信成功:', info.messageId);
    return { success: true, info };
  } catch (error: any) {
    const message = error?.message || 'メール送信に失敗しました';
    console.error('[Mailer] メール送信エラー:', message, error);
    return { success: false, error: message };
  }
}
