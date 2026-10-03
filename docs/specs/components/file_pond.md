# コンポーネント: FilePond 仕様書

- Web Component（Light DOM）
- JS クラス名: `TwFilePond`
- タグ例: `tw-file-pond` / `data-tw-component="file-pond"`
- npm `filepond` は使わない。送信 HTTP は持たない

## 属性

- `max-files` / `max-size`（バイト）/ `accept`

## メソッド

- `files`（getter）/ `removeAt(index)` / `clear()`

## イベント

- `add` / `remove` / `reject`（`getEventName`）
- `reject.detail.reason`: `max-files` | `max-size` | `accept`

## プレビュー

- 画像 MIME のみサムネイル。それ以外は名・サイズ

----

以上
