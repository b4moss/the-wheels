# コンポーネント: UserMenu 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwUserMenu`
- タグ例: `tw-user-menu`
- 内部は可能な限りセマンティックな要素で描画する
- a11y の詳細は無期限延期（将来項目）。当面は必要最小限のみ

## 目的

- ヘッダー等で使うアカウントメニュー
- トリガーは利用側が自由に組む（典型は `TwAvatar` ＋表示名テキスト）
- パネルはメニュー項目の列挙。開閉・配置は Dropdown に委譲する

## 組み合わせ

- **Dropdown**（開閉・配置・外側クリック／Escape）を内部に合成する
- **ActionMenu とは兄弟**（ActionMenu をラップしない）
- Avatar はホスト属性としては持たない。trigger slot 内で利用側が直接置く

## slot

| 名前 | 役割 |
|---|---|
| `trigger` | 発動領域。**必須**。レイアウトは利用側が自由に決める |
| （デフォルト） | メニュー項目。Dropdown の panel へ投影 |

### trigger が空のとき

- デフォルト trigger は生成しない
- 接続時（および空と判定できるタイミング）に `console.warn` を出す

## 開閉・配置

ActionMenu に揃える。

- `open` 真偽属性、`open()` / `close()` / `toggle()`
- trigger クリックで toggle
- 外側クリック、`Escape` で閉じる
- **panel 内クリックで自動クローズ**
- `placement` は内部 Dropdown に透過（未指定・不正は Dropdown 既定どおり `bottom-start`）

## メニュー項目

- デフォルト slot にリンク／ボタン等を列挙する
- 推奨マークアップ用に `data-tw-user-menu-item` を用意し、style / kitchen-sink で見た目を揃える
- 区切り線・危険色（ログアウト）の**組み込みバリアントは必須としない**（利用側 CSS で足してよい）

## 含まないもの

- ホスト上の `name` / `image-path` 等 Avatar 透過属性
- パネル内の固定ヘッダ（名前・メール領域）— 必要なら項目 slot 内に利用側が書く
- a11y 本検討

----

以上
