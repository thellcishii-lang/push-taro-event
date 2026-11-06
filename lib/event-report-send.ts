// lib/event-report-send.ts
// 最終レポートのメール送信。レポート本体の保存（lib/event-report.ts）とは分離し、
// 送信の失敗が削除処理やレポート保存に影響しないようにする。
import { authAdmin} from './firebase-admin';
import { sendEmail} from './mailer';
import {
EventFinalReport,
formatFinalReportHtml,
updateReportEmailStatus,
} from './event-report';

/**
* レポートを主催者にメール送信する。
* 戻り値は成否で、例外は投げない（呼び出し側の処理を止めないため）。
* 失敗した場合は emailStatus='failed' として残り、tick の再送スイープや
* 管理画面からの再送で送り直せる。
*/
export async function trySendFinalReportEmail(
report: EventFinalReport,
): Promise<boolean> {
if (report.emailStatus === 'sent') return true;

let organizerEmail: string | undefined;
try {
const user = await authAdmin.getUser(report.ownerUid);
organizerEmail = user.email?? undefined;
} catch {
organizerEmail = undefined;
}

if (!organizerEmail) {
await updateReportEmailStatus(report.eventId, 'no-recipient');
return false;
}

const result = await sendEmail({
to: organizerEmail,
subject: `開催結果レポート：${report.eventName}`,
html: formatFinalReportHtml(report),
});

await updateReportEmailStatus(
report.eventId,
result.success? 'sent': 'failed',
);
return result.success;
}
