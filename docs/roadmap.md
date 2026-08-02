# the-wheels ロードマップ

## v0.1.0

スタイル土台のみ。npm には公開しない（リポジトリ内で利用可能な状態まで）。

### 含むもの

- `@b4moss/the-wheels-style`
  - reset（`reset-css`）
  - フォント stack（Inter + Noto Sans JP。フォント本体は同梱しない）
  - ルート文字サイズは 62.5% 方式
  - デザイントークン（参照のユースケース色を踏襲し `--tw-` 接頭辞へ）
  - Typography（長文は `max-width: 40ch`）
  - focus / breakpoints
  - `@layer`: `reset` / `tokens` / `base` / `components`（`components` は空でよい）
  - ソースは layer / 関心ごとに分割
  - 公開エントリ: 全部入り + 部分 import（`/css/tokens` などカテゴリ付き）
- workspaces 用に `components` / `the-wheels` パッケージも用意（中身はほぼ空）
- `apps/kitchen-sink`（Vituum MPA）
  - 関心ごとの複数ページ（例: `/`, `/typography`, `/tokens`）

### 含まないもの

- Web Components の実装
- スタイルに対する自動テスト（Storybook 導入時に再検討）
- npm 公開（公開タイミングはバージョンに固定せず PO が見計らう）

詳細は [スタイル仕様](./specs/style.md) および [main.md](./main.md) を参照。

## v0.2.0

（案）SVGLoader → Spinner → Button  
（同梱 SVG は `packages/components/assets/`）

## v0.3.0

（案）Dropdown（Floating UI, flip/shift デフォルト有効）→ ActionMenu

## 以降（案）

- Accordion / Modal
- Avatar / Vertical Nav
- Storybook

## 横断方針（ビルド）

- TypeScript: `strict: true`
- 配布: ESM 主 + CJS dual package
- npm 公開: PO がタイミングを見計らう

----

以上
