const fs = require('node:fs');
const path = require('node:path');

function signature(index) {
  return JSON.stringify({
    queryScope: index.queryScope,
    fields: index.fields
      .filter(({ fieldPath }) => fieldPath !== '__name__')
      .map(({ fieldPath, order, arrayConfig }) => ({ fieldPath, order, arrayConfig }))
      .sort((a, b) => a.fieldPath.localeCompare(b.fieldPath)),
  });
}

// Check by default. --apply creates missing definitions only; never delete live indexes.
async function syncIndexes({ projectId, token, apply = false, fetchImpl = fetch }) {
  const definitions = JSON.parse(fs.readFileSync(path.join(__dirname, '../firestore.indexes.json'), 'utf8')).indexes;
  const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/collectionGroups`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const results = [];

  for (const definition of definitions) {
    const endpoint = `${base}/${encodeURIComponent(definition.collectionGroup)}/indexes`;
    const existing = [];
    let pageToken;
    do {
      const url = new URL(endpoint);
      if (pageToken) url.searchParams.set('pageToken', pageToken);
      const response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`Cannot list ${definition.collectionGroup} indexes: HTTP ${response.status}`);
      const page = await response.json();
      existing.push(...(page.indexes || []));
      pageToken = page.nextPageToken;
    } while (pageToken);

    const match = existing.find((index) => signature(index) === signature(definition));
    if (match) {
      if (match.state === 'NEEDS_REPAIR') {
        throw new Error(`${definition.collectionGroup} index needs repair in the Firebase console`);
      }
      results.push({ collection: definition.collectionGroup, state: match.state });
      continue;
    }
    if (!apply) {
      results.push({ collection: definition.collectionGroup, state: 'MISSING' });
      continue;
    }
    const { collectionGroup, ...body } = definition;
    const response = await fetchImpl(endpoint, {
      method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Cannot create ${collectionGroup} index: HTTP ${response.status}`);
    results.push({ collection: collectionGroup, state: 'CREATION_REQUESTED' });
  }
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const projectIndex = args.indexOf('--project');
  const projectId = projectIndex >= 0 ? args[projectIndex + 1] : '';
  if (!projectId || projectId.startsWith('--')) {
    throw new Error('Usage: node scripts/firestore-indexes.cjs --project PROJECT_ID [--apply]');
  }
  require('@next/env').loadEnvConfig(process.cwd());
  const { applicationDefault, cert } = require('firebase-admin/app');
  const credential = process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
    ? cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
    : applicationDefault();
  const { access_token: token } = await credential.getAccessToken();
  const results = await syncIndexes({ projectId, token, apply: args.includes('--apply') });
  for (const { collection, state } of results) console.log(`[firestore-indexes] ${collection}: ${state}`);
  if (results.some(({ state }) => state !== 'READY')) {
    console.log('[firestore-indexes] Re-run the check after creation finishes; all required indexes must be READY.');
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[firestore-indexes]', error.message);
    process.exitCode = 1;
  });
}

module.exports = { syncIndexes };
