// app/api/cleanup/route.ts
import { NextResponse } from 'next/server';
import { messaging, db, authAdmin } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let cleanupScope: string[] | null = null;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    const isAdmin = userRecord.customClaims?.admin === true;

    let ownedShopIds: string[] | null = null;
    if (!isAdmin) {
      const shopsSnapshot = await db.collection('shops')
        .where('ownerUid', '==', decoded.uid)
        .get();
      ownedShopIds = shopsSnapshot.docs.map((doc) => doc.id);
      if (ownedShopIds.length === 0) {
        return NextResponse.json({ success: true, removed: 0 }, { status: 200 });
      }
    }

    cleanupScope = ownedShopIds;
  } catch {
    return NextResponse.json({ error: '無効な認証トークンです' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ─── 30日以上更新のないトークンを取得 ───
    const snapshot = await db.collection('subscriptions')
      .where('lastActive', '<', thirtyDaysAgo)
      .get();

    const scopedDocs = cleanupScope
      ? snapshot.docs.filter((doc) => {
          const shopIds = doc.data().shopIds;
          return Array.isArray(shopIds) && shopIds.some((shopId: string) => cleanupScope.includes(shopId));
        })
      : snapshot.docs;

    if (scopedDocs.length === 0) {
      return NextResponse.json({ success: true, removed: 0 }, { status: 200 });
    }

    const allowedTopics = cleanupScope
      ? new Set(cleanupScope.map((shopId) => `shop_${shopId}_users`))
      : null;
    const cleanupItems = scopedDocs.map((doc) => {
      const data = doc.data();
      const shopIds: string[] = Array.isArray(data.shopIds) ? data.shopIds : [];
      const storedTopics: string[] = Array.isArray(data.topics) ? data.topics : [];
      const topics = Array.from(new Set([
        ...storedTopics,
        ...shopIds.map((shopId) => `shop_${shopId}_users`),
      ])).filter((topic) => !allowedTopics || allowedTopics.has(topic));
      return {
        doc,
        token: String(data.token || doc.id),
        topics,
        removedShopIds: shopIds.filter((shopId) => !cleanupScope || cleanupScope.includes(shopId)),
        remainingShopIds: shopIds.filter((shopId) => cleanupScope && !cleanupScope.includes(shopId)),
        remainingTopics: storedTopics.filter((topic) => allowedTopics && !allowedTopics.has(topic)),
      };
    });

    // 解除失敗時はDBの購読情報を残し、同じ対象を再試行できるようにする。
    await Promise.all(cleanupItems.flatMap(({ token, topics }) => topics.map(async (topic) => {
      const result = await messaging.unsubscribeFromTopic([token], topic);
      if (result.failureCount > 0) {
        const reason = result.errors.map(({ error }) => error.message).join('; ');
        throw new Error(`FCMトピック解除失敗 topic=${topic}: ${reason}`);
      }
    })));

    // ─── 購読情報を解除（クーポン履歴と顧客IDは保持）───
    const batch = db.batch();
    cleanupItems.forEach(({ doc, remainingShopIds, remainingTopics }) => {
      batch.update(doc.ref, {
        shopIds: remainingShopIds,
        topics: remainingTopics,
        updatedAt: new Date(),
      });
    });
    await batch.commit();

    // チャンクは補助データのため、古いトークンを店舗単位で確実に除去する。
    const chunkTokens = new Map<string, Set<string>>();
    cleanupItems.forEach(({ removedShopIds, token }) => {
      removedShopIds.forEach((shopId) => {
        const tokens = chunkTokens.get(shopId) || new Set<string>();
        tokens.add(token);
        chunkTokens.set(shopId, tokens);
      });
    });
    const chunkShopIds = Array.from(chunkTokens.keys());
    const chunkRefs = chunkShopIds.map((shopId) => (
      db.collection('shops').doc(shopId).collection('token_chunks').doc('chunk_1')
    ));
    const chunkSnapshots = await Promise.all(chunkRefs.map((chunkRef) => chunkRef.get()));
    const chunkBatch = db.batch();
    chunkSnapshots.forEach((snapshot, index) => {
      if (snapshot.exists) {
        chunkBatch.update(chunkRefs[index], {
          tokens: FieldValue.arrayRemove(...Array.from(chunkTokens.get(chunkShopIds[index])!)),
          updatedAt: new Date(),
        });
      }
    });
    if (chunkShopIds.length > 0) {
      await chunkBatch.commit();
    }

    console.log(`[cleanup] ✅ ${cleanupItems.length}件のトークンを削除`);

    return NextResponse.json({
      success: true,
      removed: scopedDocs.length,
    }, { status: 200 });
  } catch (error: any) {
    console.error('[cleanup] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
