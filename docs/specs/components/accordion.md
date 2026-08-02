# コンポーネント: Accordion 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwAccordion`
- ネイティブの `details` / `summary` を採用する
- **1ホスト = 1パネル**（ホスト内部に `details` を1つ描画する）
- 複数パネルの同時オープン可（ネイティブ `details` のまま）
- a11y の詳細は後日検討。追加属性は可能な限り不要にする

## slot

- `header`
- `content`
- デフォルト slot は使わない

## 構造

- header（`summary`）
- content（`details` 内の本体）
- header をクリックすると content が展開される
- 開閉インジケータは同梱の `chevron.svg` を1つ使い、SVGLoader の `rotate` で向きを変える

## 一斉開閉

- 飛地のアコーディオンも同一グループとして扱えるようにする
- 同じ `data-tw-*` 属性値を持つ要素を一括で開閉できるようにする（属性名は固定）
  - 例: `data-tw-accordion-group="faq"`
- 一斉開閉の操作は、任意のボタン等に属性を付けて行う
  - 開く: `data-tw-accordion-open="faq"`
  - 閉じる: `data-tw-accordion-close="faq"`

----

以上
