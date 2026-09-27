# TwInfiniteScroll テスト仕様

関連仕様: [specs/components/infinite_scroll.md](../../specs/components/infinite_scroll.md)  
共通前提: [tests/e2e.md](../e2e.md)  
実装: `dev/e2e/infinite-scroll.spec.ts`

- 初期にリスト項目を表示し、下端スクロールで追加取得する
- 上端／下端の往復でも件数の健全性を保つ（デモは `max-items="20"`）

対象ページ: `/infinite-scroll/`（`#is-demo`）

## テスト：正常系

- 初期にリスト項目が表示される
- 下端スクロールで件数が増える
- 追加後も項目が見える

## テスト: 異常系

- 上端へ戻して再度下端へスクロールしても、件数が減らない
- 連続スクロールしても件数がウィンドウ上限を大きく超えて膨らまない（実装アサートは件数 ≤ 40）

----

以上
