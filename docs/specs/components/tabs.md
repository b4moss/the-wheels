# コンポーネント: Tabs 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwTabs`
- ホストにタブリストとパネルを描画し、クリックで表示パネルを切り替える
- a11y の詳細は無期限延期（将来項目）。当面は `role` / `aria-selected` / 矢印キー程度の軽量対応とする

## slot

- `tab` — タブ（複数可。`button` 推奨）
- `panel` — パネル本体（`tab` と同順で対応）

## 属性

- `selected-index`: 選択中タブの 0 始まりインデックス（未指定時は `0`）

## メソッド

- `select(index)`: 指定インデックスのタブ／パネルを表示する
- `selectedIndex`（getter）: 現在の選択インデックス

----

以上
