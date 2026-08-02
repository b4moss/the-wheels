# コンポーネント: Modal 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwModal`（`HTMLElement` を継承する自律カスタム要素）
- `HTMLDialogElement` の継承（customized built-in）は使わない（Safari 非対応のため）
- ホスト内部にネイティブの `<dialog>` を1つ描画する
- 内部は可能な限りセマンティックな要素で描画する
- a11y の詳細は後日検討。追加属性は可能な限り不要にする
- 当面、カスタムイベントは発火しない（`<dialog>` の標準イベントとメソッドを利用）

## slot

- `header`
- `content`
- `footer`
- デフォルト slot は使わない

## 開く手段

- ホストメソッド `showModal()` を公開し、内部 `<dialog>` の `showModal()` に委譲する
  - top layer / ネイティブ backdrop により、祖先の stacking context や z-index 問題を避ける
  - `show()` は使わない
- 開くボタンは利用側が当該メソッドを呼ぶ

## 閉じる手段

- ホストメソッド `close()` を公開し、内部 `<dialog>` の `close()` に委譲する
- デフォルトで、header 右上に閉じるボタン（×）を置く
  - 同梱 SVG を SVGLoader で描画する（`packages/components/assets/`）
- バックドロップクリックでも閉じる
- footer などにユーザーが任意に追加した要素からも閉じられるようにする
  - 閉じたい要素に `data-tw-modal-close` 属性を付ける（`data-tw-*` 固定）

## レイアウト・サイズ

- バックドロップは `<dialog>` の `::backdrop` を利用する
- ビューポートをはみ出さない
  - ビューポートに達したときは、content 内を `overflow: scroll` とする
- 初期描画後は幅・高さを固定し、コンテンツの増減は content 内スクロールで吸収する（カクつかせないため）

----

以上
