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
Node.js: `>=22`

## インストール

```bash
npm install @b4moss/the-wheels
```

（未公開の間は、このリポジトリを workspace / `file:` 参照で利用してください。）

## 使い方

### CSS（全部入り）

```css
@import "@b4moss/the-wheels/style";
```

### 部分 CSS

部分 import は style パッケージ側が正式です。

```css
@import "@b4moss/the-wheels-style/css/tokens";
```

### JavaScript

コンポーネントは **import 時にカスタム要素として自動登録**されます。  
プレフィックスを変える場合は、**コンポーネントを import する前に** `setPrefix` を呼んでください。

```js
import { setPrefix } from "@b4moss/the-wheels";

setPrefix("app"); // タグは app-button など

// setPrefix のあとにコンポーネントを読み込む
import { TwButton } from "@b4moss/the-wheels";
```

通常（デフォルト `tw-`）はまとめて import して問題ありません。

```js
import { TwButton, TwAvatar } from "@b4moss/the-wheels";
```

### 同梱アセット（SVG）

アイコン SVG は `@b4moss/the-wheels-components` の `assets` から参照します（umbrella は JS / 全部入り CSS のみ保証）。

```js
import checkUrl from "@b4moss/the-wheels-components/assets/check.svg?url";
```

## Storybook

コンポーネント・カタログ（手動の見た目確認用）。自動 VRT は入れていません。

```bash
npm install
npm run build:components
npm run build:the-wheels
npm run dev:storybook
```

静的ビルド:

```bash
npm run build:storybook
```

preview は kitchen-sink と同様に `@b4moss/the-wheels/style` と `@b4moss/the-wheels` を読み込みます。  
パッケージの `exports` はビルド成果物（`dist`）を指すため、起動前に components / the-wheels のビルドが必要です。

## kitchen-sink（ドキュメントサイト）

説明・導入・デモ導線用の Vituum + Twig MPA です。コンポーネントカタログは Storybook を使います。

| ルート | 内容 |
| --- | --- |
| `/` | FV 付きトップ（Getting Started / Components 導線） |
| `/getting-started/` | install・style・umbrella JS・`setPrefix` 注意 |
| `/components/` | 9 WC + Typography / Tokens のデモ一覧 |
| `/button/` など | 各コンポーネントの目視デモ |

```bash
npm install
npm run build:components
npm run build:the-wheels
npm run dev:kitchen-sink
```

静的ビルド:

```bash
npm run build:kitchen-sink
```

## 開発コマンド

```bash
npm run build:style
npm run build:components
npm run build:the-wheels
npm run build:kitchen-sink
npm run build:storybook
npm run test:components
npm run test:package
npm run dev:kitchen-sink
npm run dev:storybook
```

`test:package` はビルド後の dual package（ESM + CJS）と exports 解決のスモークです。

## CI

`develop` / `dev-v*` への PR で GitHub Actions（[`.github/workflows/ci.yml`](.github/workflows/ci.yml)）が走り、上記の build / test を検証します。  
ブランチ・PR・タグ・CI/CD の方針とブランチ保護（【PO作業】）は [docs/git.md](docs/git.md) を参照してください。
