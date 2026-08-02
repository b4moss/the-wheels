# コンポーネント: Button 仕様書

- Web Component として実装する（Light DOM）
- 内部は可能な限りセマンティックな要素で描画する（例: `button`）
- a11y の詳細（追加の ARIA 等）は後日検討。追加属性は可能な限り不要にする

## slot

- 左アイコン slot
- 中央ラベル slot
- 右アイコン slot
- アイコンがない時は、当該 slot 要素を描画しない

## 属性

- `disable-on-click`（JS: `disableOnClick`）: `true` / `false`
  - `true` の場合、クリック後に `disabled` とし、スピナーを表示する
  - スピナーは SVGLoader 経由で描画する（Spinner 仕様も参照）

----

以上
