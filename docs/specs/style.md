# スタイル仕様

コンポーネント総則は [components/all.md](./components/all.md) を参照。

## パッケージ

- 名前: `@b4moss/the-wheels-style`
- 公開エントリ: 全部入り + 部分 import
  - パスはカテゴリ付き（例: `@b4moss/the-wheels-style/css/tokens`, `/css/typography`）
- ライセンス: MIT
- npm 未公開（リポジトリ内利用。公開タイミングは PO）

## ソース構成

`dev/packages/style/src` は layer / 関心ごとに分割する。

- 例: `reset.css`, `tokens.css`, `typography.css`, `focus.css`, `breakpoints.css`, `index.css`

## 含む範囲

- reset（`reset-css`）
- フォント stack
- デザイントークン
- Typography
- focus / breakpoints
- コンポーネント用スタイル（`@layer components`）
- レイアウト最低限（container / sidebar 等）

## フォント

- stack: `"Inter", "Noto Sans JP", sans-serif`
- フォント本体は同梱しない。利用側が用意する
- パッケージ側は `font-family` とフォールバックのみ定義する

## ルート文字サイズ

- `html { font-size: 62.5%; }` 方式（いわゆる 10px 基準）
- 数値トークンからの rem 換算もこの前提に合わせる

## デザイントークン

- CSS 変数名は `--tw-` 接頭辞を付ける（例: `--tw-text-main`）
- ユースケース起点。色パレット（`red-100` 等）は必要になるまで作らない

## 長文

- 1行はおおよそ40文字以内
- CSS では `max-width: 40ch` で抑える

## `@layer`

順序はこの順。

1. `reset`
2. `tokens`
3. `base`
4. `components`

## ホスト / 内部のスタイル契約

- ホスト: 要素セレクタは使わない。`[data-tw-component="..."]` で指定
- 内部: クラスで指定。クラス名に `.tw-` 接頭辞は付けない（`@layer` で区分）

## 対応ブラウザ

- Chrome / Firefox / Safari / Edge の最新2メジャー

## テスト

- スタイルに対する自動テストは行わない
- 見た目の確認は Storybook カタログ上の手動レビューとする（自動 VRT は未実施）

## Motion トークン

- `--tw-motion-duration`（既定 `180ms`）
- `--tw-motion-easing`（既定 `ease`）
- `prefers-reduced-motion: reduce` 時は `--tw-motion-duration: 0ms`

----

以上
