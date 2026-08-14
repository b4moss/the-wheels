# コンポーネント: CookieConsent 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwCookieConsent`
- タグ例: `tw-cookie-consent`
- a11y の詳細は無期限延期（将来項目）。当面は必要最小限のみ

## 目的

- 初回ランディング時に下部 snackbar 風バナーで Cookie 同意を促す
- 同意状態・バナー表示可否・サービス別許否を localStorage に保持する
- 設定画面のチェックボックス UI は作らない。サービス識別子の読み書き API を提供する

## 組み合わせ

- **下部固定レイヤ（共有モジュール）** — 将来の Toast と show/hide・配置ロジックを共有する。Toast WC 自体は作らない（[snackbar_layer.md](./snackbar_layer.md)）

## UI（バナー）

- 画面**下部**の snackbar 風
- 内容は **slot で自由**（説明文・ボタンラベルのデフォルト日本語は kitchen-sink のみ）
- 想定アクションは次の2種（実装は slot 内の要素＋ホストの委譲／属性で接続）

| アクション | 振る舞い |
|---|---|
| すべて承諾 | localStorage に全体承諾を書き、バナーを非表示 |
| 設定する | `href` で遷移する想定。**バナーも消す**（全体承諾にはしない） |

## 表示条件

- ホスト接続時に localStorage を読む
- `bannerHidden` 相当が立っていなければバナーを表示する
- キー未作成（初回）のときは **未承諾状態を初期書き込み**したうえで表示する

## localStorage

- **1 JSON** を1キーに保存する
- キー名は属性で変更可能（例: `storage-key`）。未指定時は **`tw-cookie-consent`**
- 論理フィールド:

| フィールド | 意味 |
|---|---|
| `status` | `pending`（未決定）/ `accepted`（すべて承諾）/ `partial`（サービス別で1つ以上許可）/ `rejected`（登録済みサービスがすべて拒否） |
| `bannerHidden` | バナーを出さない |
| `services` | `{ [serviceId]: boolean }` サービス別許否 |
| `expiresAt` | TTL 期限（**ISO 8601 文字列**を推奨） |

### すべて承諾

- `status = accepted`、`bannerHidden = true`
- 属性 `service-ids`（カンマ区切りの既知サービス ID）がある場合、それらをすべて `true` で `services` に書く（既存キーも true に揃える）
- `service-ids` 未指定かつ `services` が空なら、従来どおり空のまま（未登録＝全体承諾解釈は利用側）
- TTL を「今から `ttl-days`」で設定／延長する

### 属性

- `storage-key` — localStorage キー（既定 `tw-cookie-consent`）
- `ttl-days` — TTL 日数（既定 `365`）
- `service-ids` — すべて承諾時に埋めるサービス ID 一覧（例: `analytics,ads,personalization`）

### 設定する（バナーを消す）

- `status` は未決定のまま（`pending`）
- `bannerHidden = true` を追加／更新
- バナーを非表示にする（遷移は `href`）

### サービス別保存時の status

`setServiceConsent` のたびに `services` から再計算する。

- 登録キーが1つ以上あり、いずれかが `true` → `partial`
- 登録キーが1つ以上あり、すべて `false` → `rejected`
- （`services` が空のままなら status は変えない。一括の `accepted` は個別編集が入った時点で `partial` / `rejected` に落ちる）

### TTL

- 属性 `ttl-days`（単位: **日**）。未指定時は **365**
- **スライディング**: TTL 内にアクセス（接続時の有効判定・延長処理）があれば、**その日から再度 `ttl-days` 日延長**する
- **TTL 切れ**: ストレージを削除（または同等の全リセット）し、未承諾に戻してバナーを再表示する

## サービス許否 API（ホストメソッド）

チェック UI は利用側。WC は次を提供する。

- `setServiceConsent(id: string, allowed: boolean): void`
- `getServiceConsent(id: string): boolean | undefined`（未登録は `undefined`。全体 `accepted` 時の解釈は利用側でも可）
- `getAllServiceConsents(): Record<string, boolean>`

設定画面保存後に利用側がこれらのメソッドで書き込む想定。

## 含まないもの

- サービス一覧チェックボックス UI
- Toast WC 本体（共有レイヤのみ）
- a11y 本検討
- 拒否専用ボタン（「すべて拒否」は必須としない）

----

以上
