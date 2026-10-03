# コンポーネント: Pagination 仕様書

- Web Component（Light DOM）
- JS クラス名: `TwPagination`
- タグ例: `tw-pagination` / `data-tw-component="pagination"`

## 属性

- `page`（1-based）
- `total-pages`

## イベント

- `change`（`getEventName`）。`detail.page` は 1-based

## 含まないもの

- 件数セレクト
- サーバ通信
- a11y 本検討

----

以上
