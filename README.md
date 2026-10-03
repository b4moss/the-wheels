# the-wheels-reconstruct

[![CI](https://github.com/b4moss/the-wheels/actions/workflows/ci.yml/badge.svg)](https://github.com/b4moss/the-wheels/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/b4moss/the-wheels)](https://codecov.io/gh/b4moss/the-wheels)
[![npm](https://img.shields.io/npm/v/@b4moss/the-wheels)](https://www.npmjs.com/package/@b4moss/the-wheels)
[![Release](https://img.shields.io/github/v/release/b4moss/the-wheels)](https://github.com/b4moss/the-wheels/releases)
[![License](https://img.shields.io/github/license/b4moss/the-wheels)](https://github.com/b4moss/the-wheels/blob/main/LICENSE)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/b4moss/the-wheels/badge)](https://securityscorecards.dev/viewer/?uri=github.com/b4moss/the-wheels)

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
npm run build:pages # GitHub Pages 用に kitchen-sink + Storybook を組み立て
npm run test:components # コンポーネントのみテスト
npm run test:package # パッケージテスト
npm run test:e2e # Playwright E2E（kitchen-sink）
npm run dev:kitchen-sink # キッチンシンク起動
npm run dev:storybook # Storybook起動
```

リポジトリルートからは `Makefile` でも同じ scripts を実行できます（`:` は `-` に置換。例: `make build-style` / `make test-e2e`）。

`test:package` はビルド後の dual package（ESM + CJS）と exports 解決のスモークです。

`test:e2e` は Playwright（Chromium）で kitchen-sink 上の振る舞いを検証します。ローカルは kitchen-sink の `dev`、GitHub Actions の手動実行は `preview`（ポート 5173）を対象にします。PR 提出前に手元で回してください。

`build:pages` は kitchen-sink を `/`、Storybook を `/storybook/` に置いた静的サイトを `dev/pages-site/` に出力します（[#63](https://github.com/b4moss/the-wheels/issues/63)）。公開先はカスタムドメイン [https://thewheels.oss.b4m.jp/](https://thewheels.oss.b4m.jp/)（CNAME: `thewheels.oss.b4m.jp`、ベースパス `/`）。

## CI

`develop` / `dev-v*` への PR で GitHub Actions（[`.github/workflows/ci.yml`](.github/workflows/ci.yml)）が走ります。

- `verify`: `dev/` で Vitest と主要 `build:*`（PR の通常チェックはこれだけ）
- e2e は PR では回さない。手元で `npm run test:e2e` / `make test-e2e`。必要なら [E2E](.github/workflows/e2e.yml) を Actions 画面から `workflow_dispatch` で手動実行

`develop` への push で [`.github/workflows/pages.yml`](.github/workflows/pages.yml) が [https://thewheels.oss.b4m.jp/](https://thewheels.oss.b4m.jp/)（kitchen-sink）と [https://thewheels.oss.b4m.jp/storybook/](https://thewheels.oss.b4m.jp/storybook/) を公開します。PR ではビルドのみ（デプロイなし）。【PO作業】Settings → Pages → Source を GitHub Actions、Custom domain を `thewheels.oss.b4m.jp` にしてください。

ブランチ・PR・タグ・CI/CD の方針とブランチ保護（【PO作業】）は [docs/git.md](docs/git.md) を参照してください。

----

以上
