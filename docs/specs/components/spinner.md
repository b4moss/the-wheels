# コンポーネント: Spinner 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwSpinner`
- 読み込み中・処理中を示すインジケータ
- 描画は SVGLoader 経由とする
- アニメーションは **SVG アセット側**で行う（CSS 回転や WC 内スタイルでは持たない）
- a11y の詳細は v0.13.0 で検討。追加属性は可能な限り不要にする

## 用途

- Button の `disable-on-click` が有効なときの表示などに使う

## 属性

- `src`: 省略可。未指定時はパッケージ同梱の `spinner.svg`（アニメーション込み）を使う
  - 一覧は [icons.md](../icons.md) を参照
- `width` / `height`: サイズ。未指定時は親の文字サイズに追従（`1em` 相当）
- SVGLoader に委譲する見た目系（`stroke-color` 等）は必要に応じて透過する

----

以上
