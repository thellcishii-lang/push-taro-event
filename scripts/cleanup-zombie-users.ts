// scripts/cleanup-zombie-users.ts
import { authAdmin, db } from '../lib/firebase-admin';

async function cleanupZombieUsers() {
  console.log('🧹 ゾンビユーザークリーンアップを開始します...\n');

  // ============================================================
  // ① 保護対象UIDを集める
  // ============================================================
  const protectedUids = new Set<string>();

  // 1-1. 店舗オーナー（shops.ownerUid）
  const shopsSnapshot = await db.collection('shops').get();
  shopsSnapshot.docs.forEach((doc) => {
    const uid = doc.data().ownerUid;
    if (uid) protectedUids.add(uid);
  });
  console.log(`✅ 店舗オーナー: ${shopsSnapshot.size}件`);

  // 1-2. 代理店（agencies.uid）
  const agenciesSnapshot = await db.collection('agencies').get();
  agenciesSnapshot.docs.forEach((doc) => {
    const uid = doc.data().uid;
    if (uid) protectedUids.add(uid);
  });
  console.log(`✅ 代理店: ${agenciesSnapshot.size}件`);

  // 1-3. アフィリエイター（affiliates.uid）
  const affiliatesSnapshot = await db.collection('affiliates').get();
  affiliatesSnapshot.docs.forEach((doc) => {
    const uid = doc.data().uid;
    if (uid) protectedUids.add(uid);
  });
  console.log(`✅ アフィリエイター: ${affiliatesSnapshot.size}件`);

  console.log(`\n🔒 保護対象UID合計: ${protectedUids.size}件\n`);

  // ============================================================
  // ② Authユーザーを1件ずつチェック
  // ============================================================
  const listUsersResult = await authAdmin.listUsers();
  const authUsers = listUsersResult.users;
  console.log(`📋 Authユーザー総数: ${authUsers.length}件\n`);

  let deletedCount = 0;
  let skippedAdminCount = 0;
  const deletedList: Array<{ email: string; uid: string }> = [];

  for (const user of authUsers) {
    // 2-1. 保護対象ならスキップ
    if (protectedUids.has(user.uid)) {
      continue;
    }

    // 2-2. 管理者（customClaims.admin === true）ならスキップ
    if (user.customClaims?.admin === true) {
      skippedAdminCount++;
      continue;
    }

    // 2-3. ゾンビユーザーとして削除
    try {
      await authAdmin.deleteUser(user.uid);
      deletedList.push({ email: user.email || '(no email)', uid: user.uid });
      console.log(`🗑️  削除: ${user.email || '(no email)'} (${user.uid})`);
      deletedCount++;
    } catch (err) {
      console.error(`❌ 削除失敗: ${user.email || '(no email)'}`, err);
    }
  }

  // ============================================================
  // ③ 結果サマリー
  // ============================================================
  console.log('\n========================================');
  console.log(`✅ 完了: ${deletedCount}件のゾンビユーザーを削除しました`);
  console.log(`🛡️  管理者としてスキップ: ${skippedAdminCount}件`);
  console.log(`🔒 保護対象としてスキップ: ${protectedUids.size}件`);
  console.log('========================================\n');

  if (deletedList.length > 0) {
    console.log('【削除したユーザー一覧】');
    deletedList.forEach((u) => console.log(`  - ${u.email} (${u.uid})`));
  }

  console.log('\n🎉 クリーンアップ処理が正常に終了しました。');
}

cleanupZombieUsers().catch((err) => {
  console.error('❌ クリーンアップ処理中に致命的エラー:', err);
  process.exit(1);
});
