# コンポーネント: ActionMenu 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwActionMenu`
- いわゆる、縦向きスリードットをクリックしたら操作メニューが出てくるもの
  - 例: 編集 / 削除

## 組み合わせ

- Dropdown（開閉・配置）
- SVGLoader（トリガーアイコン）

## トリガーアイコン

- パッケージ同梱のデフォルト SVG（三本点）を SVGLoader で表示する
  - アセットは `packages/components/assets/` に置く
- 利用側で差し替え可能とする

## メニュー項目

- デフォルト slot に項目を列挙する
- ユーザーが項目を自由に追加できるようにする
- 項目クリック後はメニューを自動で閉じる

----

以上
