// lib/event-info.ts
// Push-taro EVENT の案内PDF（events/{eventId}/infoPdfs、最大5件）。
// ファイル本体は Firebase Storage に置き、ここではメタデータ（タイトル・URL・
// Storageパス）だけを管理する。アップロード自体は管理画面からクライアントSDKで
// 行い（本家の画像アップロードと同じ方式）、登録時に件数上限をサーバーで守る。
// infoPdfs は個人情報を含まない台帳なので、リセット・終了削除の対象外。
import { FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { db } from './firebase-admin';
import { MAX_INFO_PDFS } from './event';

export const EVENT_INFO_PDFS_COLLECTION = 'infoPdfs';

/** 案内PDFの置き場（Storage 上のディレクトリ名）。 */
export const INFO_PDFS_DIR = 'info-pdfs';

export interface EventInfoPdf {
  id: string;
  title: string;
  url: string;
  storagePath: string;
  createdAt: string;
}

/**
 * 案内PDFの Storage パスが「所有者本人の現行形式パス」か（純粋関数）。
 * 現行形式は organizers/{ownerUid}/events/{eventId}/info-pdfs/{fileName}.pdf で、
 * Storage ルールがパス内の uid 一致だけで書き込みを判定することと対になる。
 * 移行前の events/{eventId}/info-pdfs/… は登録では受け付けない
 * （保存済みの旧形式は読み取り・削除にはそのまま使える）。
 */
export function isInfoPdfStoragePath(
  ownerUid: string,
  eventId: string,
  storagePath: unknown,
): boolean {
  if (typeof storagePath !== 'string') return false;
  const prefix = `organizers/${ownerUid}/events/${eventId}/${INFO_PDFS_DIR}/`;
  if (!storagePath.startsWith(prefix)) return false;
  const fileName = storagePath.slice(prefix.length);
  return (
    !!fileName &&
    !fileName.includes('/') &&
    !fileName.includes('..') &&
    fileName.toLowerCase().endsWith('.pdf')
  );
}

/** PDF上限に達しているか。 */
export function isInfoPdfCapReached(count: number, cap: number = MAX_INFO_PDFS): boolean {
  return count >= cap;
}

function infoPdfsRef(eventId: string) {
  return db
    .collection('events')
    .doc(eventId)
    .collection(EVENT_INFO_PDFS_COLLECTION);
}

function toInfoPdf(doc: FirebaseFirestore.DocumentSnapshot): EventInfoPdf {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    title: String(d.title ?? ''),
    url: String(d.url ?? ''),
    storagePath: String(d.storagePath ?? ''),
    createdAt: d.createdAt?.toDate?.().toISOString() ?? '',
  };
}

export async function listInfoPdfs(eventId: string): Promise<EventInfoPdf[]> {
  const snap = await infoPdfsRef(eventId).get();
  return snap.docs
    .map((doc) => toInfoPdf(doc))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function addInfoPdf(
  eventId: string,
  input: { title: string; url: string; storagePath: string; ownerUid: string },
): Promise<EventInfoPdf> {
  const title = input.title.trim();
  if (!title) throw new Error('PDFのタイトルが必要です');
  if (!input.url) throw new Error('PDFのURLが必要です');
  if (!isInfoPdfStoragePath(input.ownerUid, eventId, input.storagePath)) {
    throw new Error('保存先パスが不正です');
  }
  const countSnap = await infoPdfsRef(eventId).count().get();
  if (isInfoPdfCapReached(countSnap.data().count)) {
    throw new Error(`案内PDFは最大${MAX_INFO_PDFS}件までです`);
  }
  const ref = infoPdfsRef(eventId).doc();
  await ref.set({
    title,
    url: input.url,
    storagePath: input.storagePath,
    createdAt: FieldValue.serverTimestamp(),
  });
  const created = await ref.get();
  return toInfoPdf(created);
}

export async function deleteInfoPdf(eventId: string, pdfId: string): Promise<void> {
  const ref = infoPdfsRef(eventId).doc(pdfId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('PDFが見つかりません');
  const storagePath = String(snap.data()?.storagePath ?? '');
  await ref.delete();
  // Storage 本体の削除はベストエフォート（失敗してもメタデータ削除は成立させる）
  if (storagePath) {
    try {
      await getStorage().bucket().file(storagePath).delete();
    } catch {
      // 既に無い・権限なし等は無視する
    }
  }
}
