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

## kitchen-sink

目視確認用の Vituum MPA です。

```bash
npm install
npm run build:components
npm run build:the-wheels
npm run dev:kitchen-sink
```

パッケージの `exports` はビルド成果物（`dist`）を指すため、kitchen-sink 起動前に components / the-wheels のビルドが必要です。

## 開発コマンド

```bash
npm run build:style
npm run build:components
npm run build:the-wheels
npm run build:kitchen-sink
npm run test:components
npm run test:package
npm run dev:kitchen-sink
```

`test:package` はビルド後の dual package（ESM + CJS）と exports 解決のスモークです。
