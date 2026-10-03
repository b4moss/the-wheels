# コンポーネント: Accordion 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwAccordion`
- ネイティブの `details` / `summary` を採用する
- **1ホスト = 1パネル**（ホスト内部に `details` を1つ描画する）
- 複数パネルの同時オープン可（ネイティブ `details` のまま）
- a11y の詳細は無期限延期（将来項目）。当面は必要最小限のみ。追加属性は可能な限り不要にする

## 属性

- `open`（真偽）: 展開状態。内部 `details.open` と同期する

## メソッド

- `open()` / `close()`: ホストから開閉する（内部 `details` に委譲）

## slot

- `header`
- `content`
- デフォルト slot は使わない

## 構造

- header（`summary`）
- content（`details` 内の本体）
- header をクリックすると content が展開される
- 開閉インジケータは同梱の `chevron.svg` を1つ使い、SVGLoader の `rotate` で向きを変える
- 定数 `CHEVRON_SRC` も export する

## 一斉開閉

- 飛地のアコーディオンも同一グループとして扱えるようにする
- 同じ `data-tw-*` 属性値を持つ要素を一括で開閉できるようにする（属性名は固定）
  - ホスト: `data-tw-accordion-group="faq"`
  - 開く操作: `data-tw-accordion-open="faq"`
  - 閉じる操作: `data-tw-accordion-close="faq"`
- モジュール import 時に `ensureAccordionGroupDelegation()` が走り、document クリックで上記操作属性を委譲する
- JS からも一括操作できる（`openAccordionsByGroup` / `closeAccordionsByGroup`）

----

以上
