# TwCookieConsent テスト仕様

関連仕様: [specs/components/cookie_consent.md](../../specs/components/cookie_consent.md)  
共通前提: [tests/e2e.md](../e2e.md)

## TwCookieConsent（初回表示）

- ホスト接続時に localStorage を読む。キー未作成なら未承諾を初期書き込みしたうえでバナーを出す
- バナーは画面下部。既定キーは `tw-cookie-consent`

対象ページ: `/cookie-consent/`。各シナリオ前にデモのリセット（または storage クリア＋リロード）で初期化する

### テスト：正常系

- リセット後、バナー（下部）が表示される
- localStorage に JSON があり、`status` が `pending` 相当である
- `bannerHidden` が false 相当である

### テスト: 異常系

- リセット後に再訪相当（リロード）してもバナーが出る
- `status` は `pending` のままである

## TwCookieConsent（すべて承諾）

- 「すべて承諾」で全体承諾を書き、バナーを非表示にする
- `service-ids` 対象のサービスをすべて `true` にする

対象ページ: `/cookie-consent/`

### テスト：正常系

- 「すべて承諾」でバナーが消える
- storage の `status` が `accepted`
- `service-ids` 対象のサービスがすべて `true`（デモのチェックがすべて ON）

### テスト: 異常系

- 承諾後にリロードしてもバナーは出ない（期限内・`bannerHidden`）
- 承諾後もページが例外なく操作可能である

## TwCookieConsent.setServiceConsent

- サービス別の許否を書き、`services` から `status` を再計算する
- 1つ以上 ON なら `partial`、すべて OFF なら `rejected`
- デモの JSON 表示はチェック操作に追従する

対象ページ: `/cookie-consent/`

### テスト：正常系

- 1つ以上 ON にすると `status` が `partial`（またはデモ JSON 上そう見える）
- すべて OFF にすると `status` が `rejected`
- JSON 表示（デモの textarea）がチェック操作に追従する

### テスト: 異常系

- Apply で不正 JSON を入れてもページが落ちない（デモのエラー表示または無視）
- 不正 JSON 適用後も例外スローしない
- チェック状態が壊れてもホストが操作可能である

## TwCookieConsent（設定する）

- 「設定する」はバナーを消すが、全体承諾にはしない
- `status` は `pending` のまま、`bannerHidden` を true にする

対象ページ: `/cookie-consent/`

### テスト：正常系

- 「設定する」でバナーが消える
- `status` は `pending` のままである
- `bannerHidden` が true 相当である

### テスト: 異常系

- 設定後にリロードしても、期限内はバナーが出ない（`bannerHidden`）
- 全体承諾（`accepted`）にはならない

----

以上
