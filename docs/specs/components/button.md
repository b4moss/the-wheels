# コンポーネント: Button 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwButton`
- 内部は可能な限りセマンティックな要素で描画する（例: `button`）
- a11y の詳細（追加の ARIA 等）は後日検討。追加属性は可能な限り不要にする

## slot

- `icon-left`
- デフォルト slot（中央ラベル）
- `icon-right`
- アイコンがない時は、当該 slot 要素を描画しない

## 属性

- `variant`: `default` | `stroke` | `ghost`（未指定時は `default`）
  - `default`: 反転色で fill
  - `stroke`: 枠あり・背景透明
  - `ghost`: 枠なし・背景透明
- `type`: 内部の `button` に透過する（未指定時は `button`）
- `disable-on-click`（JS: `disableOnClick`）: HTML 真偽属性
  - 付与されている場合、クリック後に `disabled` とし、スピナーを表示する
  - 表示は **ラベル（およびアイコン slot）を隠し、スピナーのみ** とする
  - スピナーは SVGLoader / Spinner 経由で描画する（Spinner 仕様も参照）

## メソッド

- `reset()`: `disable-on-click` 後の disabled / スピナー状態を解除する
  - 復帰用の UI はパッケージ側では提供しない
  - 利用側が自前の UI から `reset()` を呼ぶ

----

以上
