# コンポーネント仕様書: 総則

## タグ名・接頭辞

- WC のデフォルト接頭辞は `tw-` とする（例: `tw-avatar`）
- 過去の `twls-` は廃止する
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

## 同梱アセット

- Spinner / ActionMenu 三本点などの同梱 SVG は `packages/components/assets/` に集約する

## ホストとスタイルの対応

- カスタム要素のホストには、接頭辞のいかんにかかわらず `data-tw-component` を付与する
  - 例: `data-tw-component="avatar"`
  - デフォルト接頭辞（`tw-`）でも、オーバーライド後でも、両方とも付与する
- ホストへのスタイル指定に、要素セレクタ（例: `tw-avatar`）は使わない
  - ホストは `[data-tw-component="avatar"]` で指定する

## 内部要素のクラス

- ホスト配下の内部要素はクラスでスタイリングする
- クラス名に `.tw-` 接頭辞は付けない
- スタイルの区分けは `@layer`（`reset` / `tokens` / `base` / `components`）で行う

## 対応ブラウザ

- Chrome / Firefox / Safari / Edge の最新2メジャー

----

以上
