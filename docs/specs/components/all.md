# コンポーネント仕様書: 総則

## タグ名・接頭辞

- WC のデフォルト接頭辞は `tw-` とする（例: `tw-avatar`）
- ユーザーが接頭辞をオーバーライドできるようにする
  - API: `setPrefix('app')` のようにグローバル設定する
  - オーバーライドは、コンポーネント登録より前の、なるべく早期に行う
- `setPrefix` を呼ばない場合でも、各モジュールを import すればデフォルト `tw-` として自動登録する
  - 接頭辞を変えるときは、対象コンポーネントを import する前に `setPrefix` を呼ぶ

## JS クラス名

- `Tw` + PascalCase とする（例: `TwButton`, `TwAvatar`）

## 真偽属性

- HTML 真偽属性とする（属性が存在すれば true）
  - 例: `<tw-button disable-on-click>`

## data 属性

- `data-tw-*` は接頭辞変更しても **固定**（決め打ち）
  - 例: `data-tw-component`, `data-tw-modal-close`, `data-tw-accordion-open`
- ホストには常に `data-tw-component` を付与する（例: `data-tw-component="avatar"`）
- ホストへのスタイル指定に要素セレクタは使わない
  - ホストは `[data-tw-component="avatar"]` で指定する

## カスタムイベント

- 既定はカスタムイベントを発火しない
  - DOM 標準イベント（例: `<dialog>` の `close` / `toggle`）とホストメソッドで足りる範囲とする
- **例外**（非同期供給や、選択結果を利用側へ渡す必要があるもの）
  - 現行: Combobox の `load-request`（[combobox.md](./combobox.md)）
  - 予定: FilePond（v0.14.0。[plans/v0.14.0](../../plans/v0.14.0/filepond.md)）
- 例外で出す場合、イベント名の接頭辞は `setPrefix` に **追従**する（`getEventName`）

## 同梱アセット

- 同梱 SVG は `packages/components/assets/` に集約する
- 対象一覧・入手方針は [icons.md](../icons.md) を参照
  - 例: `spinner`, `more-vertical`, `close`, `menu`, `check`, `chevron`（1種・rotate で開閉）, `lock`
  - 上記以外は同梱しない（利用側が用意）

## 内部要素のクラス

- ホスト配下の内部要素はクラスでスタイリングする
- クラス名に `.tw-` 接頭辞は付けない
- スタイルの区分けは `@layer`（`reset` / `tokens` / `base` / `components`）で行う

## 対応ブラウザ

- Chrome / Firefox / Safari / Edge の最新2メジャー

----

以上
