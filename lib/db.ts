import Dexie, { Table } from 'dexie';

export interface PushHistory {
  id?: number;
  title: string;
  body: string;
  imageUrl?: string;
  linkUrl?: string;
  sentAt: Date;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
  successCount?: number; // 👈 ここを追加！
  notificationId?: string;
  jobId?: string;
  deliveredCount?: number;
  openedCount?: number;
  openRate?: number;
}

class PushTaroDB extends Dexie {
  history!: Table<PushHistory>;

  constructor() {
    super('PushTaroDB');
    this.version(1).stores({
      history: '++id, sentAt',
    });
    this.version(2).stores({
      history: '++id, sentAt',
      notifications: '++id, timestamp',
    });
    this.version(3).stores({
      history: '++id, sentAt',
      notifications: '++id, timestamp',
    });
  }
}

export const db = new PushTaroDB();

// JSONとしてエクスポート（フォルダダウンロード）
export async function exportHistoryToJSON(): Promise<string> {
  const all = await db.history.toArray();
  return JSON.stringify(all, null, 2);
}

// JSONからインポート（フォルダ読み込み）
export async function importHistoryFromJSON(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString) as PushHistory[];
  await db.history.bulkAdd(
    data.map(({ id: _ignoredId, ...rest }) => ({
      // id は除外して自動採番に任せ、既存レコードとのキー衝突による
      // BulkError（途中打ち切り）を防ぐ
      ...rest,
      sentAt: new Date(rest.sentAt),
    }))
  );
}
