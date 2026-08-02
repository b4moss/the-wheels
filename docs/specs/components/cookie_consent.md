# コンポーネント: CookieConsent 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwCookieConsent`
- タグ例: `tw-cookie-consent`
- a11y の詳細は無期限延期（将来項目）。当面は必要最小限のみ
- 実装版: **v0.12.0**

## 目的

- 初回ランディング時に下部 snackbar 風バナーで Cookie 同意を促す
- 同意状態・バナー表示可否・サービス別許否を localStorage に保持する
- 設定画面のチェックボックス UI は作らない。サービス識別子の読み書き API を提供する

## 組み合わせ

- **下部固定レイヤ（共有モジュール）** — 将来の Toast と show/hide・配置ロジックを共有する。v0.12.0 ではレイヤのみ先行し、Toast WC 自体は作らない（名称は実装時に固定。例: snackbar layer）

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
- キー名は属性で変更可能（例: `storage-key`）。未指定時は固定デフォルト（例: `tw-cookie-consent`）
- 論理フィールド（名称は実装で固定してよい）:

| フィールド | 意味 |
|---|---|
| `status` | 例: `pending`（未承諾）/ `accepted`（全体承諾） |
| `bannerHidden` | バナーを出さない |
| `services` | `{ [serviceId]: boolean }` サービス別許否 |
| `expiresAt` | TTL 期限（ISO 日時または epoch。実装で固定） |

### すべて承諾

- `status = accepted`、`bannerHidden = true`
- **`services` は触らない**（未登録サービスは全体承諾と解釈する）
- TTL を「今から `ttl-days`」で設定／延長する

### 設定する（バナーを消す）

- `status` は未承諾のまま（`pending`）
- `bannerHidden = true` を追加／更新
- バナーを非表示にする（遷移は `href`）

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
