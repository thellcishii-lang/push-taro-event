# 購読データの店舗ID修復

## 実行方法

- system-admin に管理者としてログインし、「購読データを全件修復」を実行する。
- または Cron / 運用端末から `POST /api/system-admin/repair-subscriptions` を呼ぶ。
  `Authorization: Bearer <CRON_SECRET>` または `x-cron-secret: <CRON_SECRET>` が必要。
  管理者の Firebase ID トークンによる Bearer 認証も利用可能。
- GET では更新しない。自動スケジュールの登録は別途必要。

```sh
curl --fail-with-body --request POST \
  --header "x-cron-secret: $CRON_SECRET" \
  "$BASE_URL/api/system-admin/repair-subscriptions"
```

## 修復内容

- 全 subscriptions をドキュメントID順に200件ずつ走査する。不正なドキュメントだけを
  トランザクションで再取得し、通常の購読処理と競合した場合は再試行する。
- shopIds / unsubscribedShopIds の正常な文字列配列は変更しない。
- Map は直下の値から20文字の半角英数字を抽出し、重複を除いた配列へ置換する。
  token キー（大文字小文字を問わない）は値の形式に関係なく破棄する。
- null / 未設定 / スカラーは空配列へ、非文字列を含む配列は文字列のみの配列へ修復する。
- 候補がない既存の値は空配列とし、needsReview / reviewFields に記録する。
  token しか残っていないデータから元の店舗を特定することはできないため、
  監査記録を確認し、別の信頼できる記録から店舗との紐付けを確認すること。
- 更新対象はこの2フィールドと updatedAt のみ。クーポン・顧客情報・FCMトピックは変更しない。

## 結果・監査

レスポンスとサーバーログに runId / scanned / repaired / needsReview と
before / after を出力する。before / after の shopIds / unsubscribedShopIds は
配列要素の総数（Map 等は0）、invalidFields は不正なフィールドの総数。
これは走査時点の集計であり、同時更新下の厳密な同一時点のスナップショットではない。

Firestore の `subscriptionRepairRuns/{runId}` に実行者・進行状況・集計を保存する。
`documents/{SHA256(subscriptionId)}` に修復した subscriptionId、修復前後の型と件数、
復元した配列・要確認フィールドを、修復本体と同じトランザクションで保存する。
subscriptionId はFCMトークンのためログには出力せずハッシュで照合する。
監査記録は既存の Firestore ルールにより管理者のみアクセスできる。

実行上限は300秒（ホスティング側の上限も確認すること）。
大量データでタイムアウトした場合や500の場合は監査記録を確認し、再実行する。
完了していない実行は completed にならない。強制終了時は running のまま残る場合がある。
修復済みデータは再実行で変更されず、途中までの修復は保持される。
成功レスポンスの `after.invalidFields = 0` と `needsReview` を確認する。
本番実行前にバックアップを取得し、要確認データの手動復元に備えること。
