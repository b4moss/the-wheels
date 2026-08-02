# スタイル仕様

コンポーネント総則は [components/all.md](./components/all.md) を参照。

## パッケージ

- 名前: `@b4moss/the-wheels-style`
- 公開エントリ: 全部入り + 部分 import（例: `/tokens`, `/typography`）
- ライセンス: MIT
- v0.1.0 時点では npm 未公開（リポジトリ内利用）

## 含む範囲（v0.1.0）

- reset（`reset-css`）
- フォント stack
- デザイントークン
- Typography
- focus / breakpoints

## フォント

- stack: `"Inter", "Noto Sans JP", sans-serif`
- フォント本体は同梱しない。利用側が用意する
- パッケージ側は `font-family` とフォールバックのみ定義する

## デザイントークン

- CSS 変数名は `--tw-` 接頭辞を付ける（例: `--tw-text-main`）
- ユースケース起点。色パレット（`red-100` 等）は必要になるまで作らない
- v0.1.0 の初期値は参照実装のユースケース色を踏襲し、`--tw-` にリネームする

## 長文

- 1行はおおよそ40文字以内
- CSS では `max-width: 40ch` で抑える

## `@layer`

初期から次を用意する（順序はこの順）。

1. `reset`
2. `tokens`
3. `base`
4. `components`（v0.1.0 では空でよい）

## ホスト / 内部のスタイル契約

- ホスト: 要素セレクタは使わない。`[data-tw-component="..."]` で指定
- 内部: クラスで指定。クラス名に `.tw-` 接頭辞は付けない（`@layer` で区分）

## テスト

- スタイルに対する自動テストは行わない
- Storybook 導入時に再検討する

----

以上
