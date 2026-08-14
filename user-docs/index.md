# The Wheels ユーザーガイド

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


----

以上