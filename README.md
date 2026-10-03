# the-wheels-reconstruct

The Wheels デザインシステム（スタイル + Web Components）の monorepo です。  
社内プロジェクトから全部入りパッケージで試し導入できる状態を目指しています。

## パッケージ

| パッケージ | 役割 |
| --- | --- |
| `@b4moss/the-wheels` | 全部入り（components API 再エクスポート + 全部入り CSS） |
| `@b4moss/the-wheels-components` | Web Components 本体 |
| `@b4moss/the-wheels-style` | CSS（トークン / typography / components レイヤーなど） |

ライセンス: MIT  
Node.js: `>=24`

## インストール

```bash
npm install @b4moss/the-wheels
```

（未公開の間は、このリポジトリを workspace / `file:` 参照で利用してください。）

## 使い方

[ユーザーガイド](./user-docs/index.md)を参照してください。

## 開発コマンド

npm workspace のルートは `dev/` です。

```bash
cd dev
npm install
npm run build:style # スタイルのみ生成
npm run build:components # コンポーネントのみ生成
npm run build:the-wheels # 全部入り生成
npm run build:kitchen-sink # キッチンシンクのみ生成
npm run build:storybook # Storybookのみ生成
npm run test:components # コンポーネントのみテスト
npm run test:package # パッケージテスト
npm run test:e2e # Playwright E2E（kitchen-sink）
npm run dev:kitchen-sink # キッチンシンク起動
npm run dev:storybook # Storybook起動
```

リポジトリルートからは `Makefile` でも同じ scripts を実行できます（`:` は `-` に置換。例: `make build-style` / `make test-e2e`）。

`test:package` はビルド後の dual package（ESM + CJS）と exports 解決のスモークです。

`test:e2e` は Playwright（Chromium）で kitchen-sink 上の振る舞いを検証します。ローカルは kitchen-sink の `dev`、CI は `preview`（ポート 5173）を対象にします。

## CI

`develop` / `dev-v*` への PR で GitHub Actions（[`.github/workflows/ci.yml`](.github/workflows/ci.yml)）が走ります。

- `verify`: `dev/` で Vitest と主要 `build:*`
- `e2e`: Playwright（Chromium）。kitchen-sink の `preview` に対して実行。変更がすべて `docs/**` または `*.md` ならスキップ

ブランチ・PR・タグ・CI/CD の方針とブランチ保護（【PO作業】）は [docs/git.md](docs/git.md) を参照してください。

----

以上