import { authAdmin } from '../lib/firebase-admin';

const YOUR_UID = 'ePh0sLeKEPaLNMdtCmNKXqw164W2';

async function setAdmin() {
  try {
    await authAdmin.setCustomUserClaims(YOUR_UID, { admin: true });
    console.log('✅ 管理者権限を付与しました');
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

setAdmin();
