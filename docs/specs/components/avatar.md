# コンポーネント: Avatar 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwAvatar`
- ユーザーアイコン等に使用する
- 形状は正円
- a11y の詳細は無期限延期（将来項目）。当面は必要最小限のみ。追加属性は可能な限り不要にする

## 属性

- `image-path`（JS: `imagePath`）: text
- `alt`: text
- `name`: text
- `color`: hex または CSS variable
- `width` / `height`: サイズ（px）

## 振る舞い

- `image-path` が設定されているときは、画像を少し小さくしてレンダリングする（背景が枠線のように見える）
- `image-path` が設定されていないときは、`name` の1文字目をレンダリングする
  - 1文字目は Unicode の書記素クラスタとして扱う（絵文字等を1文字とみなす）
- `color` が設定されていないときは、既存トークン相当（`--tw-bg-button-optional`）をデフォルト背景色とする
- テキストの色は、背景色に対する WCAG コントラスト比を計算して選ぶ（JS で計算）

----

以上
