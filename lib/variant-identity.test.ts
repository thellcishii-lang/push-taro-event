// lib/variant-identity.test.ts
// バリアント識別ガード。
//
// バリアント同士はフォークで作るため、コピー元のプロジェクト ID や
// 公開 URL がコードに残ると、来場者が別バリアントのアプリへ飛ぶ事故に
// なる（初詣のフォーク時に EVENT の origin が残った実例がある）。
// このテストは「このバリアント（EVENT）の値が正しいこと」と
// 「他バリアントの ID がコードのどこにも残っていないこと」を常時検証し、
// 混入したまま出荷されるのを防ぐ。
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { APP_ORIGIN } from './app-origin';
import { DEFAULT_STORAGE_BUCKET } from './storage-bucket';
import {
  OTHER_VARIANT_PROJECT_IDS,
  VARIANT_DEFAULT_STORAGE_BUCKET,
  VARIANT_PROJECT_ID,
} from './variant-identity';

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(LIB_DIR, '..');

/** スキャン対象外: 他バリアント ID を「定義として」持つファイル自身。 */
const SCAN_EXCLUDED_FILES = new Set([
  path.join('lib', 'variant-identity.ts'),
]);

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      files.push(...collectSourceFiles(full));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx')
    ) {
      files.push(full);
    }
  }
  return files;
}

describe('バリアント識別（EVENT）', () => {
  it('プロジェクト ID は push-taro-event に固定されている', () => {
    expect(VARIANT_PROJECT_ID).toBe('push-taro-event');
  });

  it('APP_ORIGIN は自バリアントの App Hosting ドメインを指す', () => {
    const host = new URL(APP_ORIGIN).host;
    expect(host.endsWith('--push-taro-event.asia-east1.hosted.app')).toBe(true);
    expect(APP_ORIGIN).toBe(
      'https://push-taro-event--push-taro-event.asia-east1.hosted.app',
    );
    for (const otherId of OTHER_VARIANT_PROJECT_IDS) {
      expect(APP_ORIGIN).not.toContain(otherId);
    }
  });

  it('既定ストレージバケットは自プロジェクトのバケット', () => {
    expect(DEFAULT_STORAGE_BUCKET).toBe('push-taro-event.firebasestorage.app');
    expect(DEFAULT_STORAGE_BUCKET).toBe(VARIANT_DEFAULT_STORAGE_BUCKET);
  });

  it('コード内に他バリアントのプロジェクト ID が残っていない', () => {
    const targets = ['lib', 'app', 'components'].flatMap((dir) =>
      collectSourceFiles(path.join(REPO_ROOT, dir)),
    );
    expect(targets.length).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const file of targets) {
      const relative = path.relative(REPO_ROOT, file);
      if (SCAN_EXCLUDED_FILES.has(relative)) continue;
      const text = readFileSync(file, 'utf8');
      for (const otherId of OTHER_VARIANT_PROJECT_IDS) {
        if (text.includes(otherId)) {
          offenders.push(`${relative} に ${otherId} が残っています`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
