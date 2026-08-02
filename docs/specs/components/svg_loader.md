# コンポーネント: SVGLoader 仕様書

- Web Component として実装する（Light DOM）
- SVG を描画するラッパー
- SVG の取得は `src` による fetch とする
- 当プロジェクト内でアイコンを扱うときは、原則として SVG で用意し、このコンポーネントを経由する
- a11y の詳細は後日検討。追加属性は可能な限り不要にする

## 属性

- `src`: SVG の URL（fetch して描画）
- `width` (px)
- `height` (px)
- `padding` (px)
  - 本来はスタイル側の責務だが、実装時の調整しやすさのため例外として props で持つ
- `stroke-width`（JS: `strokeWidth`）(px)
- `fill-color`（JS: `fillColor`）: hex または CSS variable
- `stroke-color`（JS: `strokeColor`）: hex または CSS variable
- `flip`
  - `vertical`
  - `horizontal`
  - `both`
- `rotate` (deg)

## 失敗時

- `src` の fetch に失敗した場合は、フォールバックを描画する（簡易プレースホルダ、または空 SVG）

----

以上
