# the-wheels ロードマップ

## v0.1.0

スタイル土台のみ。npm には公開しない（リポジトリ内で利用可能な状態まで）。

### 含むもの

- `@b4moss/the-wheels-style`
  - reset（`reset-css`）
  - フォント stack（Inter + Noto Sans JP。フォント本体は同梱しない）
  - デザイントークン（参照のユースケース色を踏襲し `--tw-` 接頭辞へ）
  - Typography（長文は `max-width: 40ch`）
  - focus / breakpoints
  - `@layer`: `reset` / `tokens` / `base` / `components`（`components` は空でよい）
  - 公開エントリ: 全部入り + 部分 import（`/tokens` など）
- workspaces 用に `components` / `the-wheels` パッケージも用意（中身はほぼ空）
- `apps/kitchen-sink`（Vituum MPA。typography / token の目視確認）

### 含まないもの

- Web Components の実装
- スタイルに対する自動テスト（Storybook 導入時に再検討）
- npm 公開

詳細は [スタイル仕様](./specs/style.md) および [main.md](./main.md) を参照。

## v0.2.0

（案）SVGLoader → Spinner → Button

## v0.3.0

（案）Dropdown → ActionMenu

## 以降（案）

- Accordion / Modal
- Avatar / Vertical Nav
- Storybook

----

以上
