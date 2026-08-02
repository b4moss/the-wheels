# コンポーネント: Spinner 仕様書

- Web Component として実装する（Light DOM）
- 読み込み中・処理中を示すインジケータ
- 描画は SVGLoader 経由とする（共通のスピナー SVG を `src` で渡す）
- a11y の詳細は後日検討。追加属性は可能な限り不要にする

## 用途

- Button の `disable-on-click` が有効なときの表示などに使う

## 属性

- `src`: 省略可。未指定時はパッケージ同梱のデフォルト spinner SVG を使う
- `width` / `height`: サイズ。未指定時は親の文字サイズに追従（`1em` 相当）
- SVGLoader に委譲する見た目系（`stroke-color` 等）は必要に応じて透過する

----

以上
