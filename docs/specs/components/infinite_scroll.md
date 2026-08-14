# コンポーネント: InfiniteScroll 仕様書

- Web Component として実装する（Light DOM）。マージ／ウィンドウ用の純関数も同モジュールから export する
- JS クラス名: `TwInfiniteScroll`
- Combobox 以外（長いリスト・フィード等）でも使えることを意図する
- a11y の詳細は無期限延期（将来項目）。当面は必要最小限のみ
- Combobox からの利用は [combobox.md](./combobox.md) を参照

## 目的

- 初期にメモリ上の一部（または空）を持ち、**上下方向**のスクロールで追加取得する
- 取得結果を単純追記するだけでなく、**ソートキーに従ってマージ／再ソート**し、可能な限りがたつきなく自然に差し込む
- DOM／メモリ上の要素数を **ウィンドウ**で抑え、パフォーマンスを保つ

## データ取得

- 利用側（または親 Combobox）が渡すローダを呼ぶ
  - 形は Combobox の `loadOptions` と同じく、メタ付き戻りを推奨する

```ts
async (ctx) => {
  // ctx: { query?, page, signal, direction: 'up' | 'down' | 'initial' }
  return { items, hasMore, nextPage? }
}
```

- `direction` で上端／下端／初期を区別する
- `hasMore` は方向ごとに管理してよい（上にまだある／下にまだある）
- **`autoLoad`**（JS プロパティ、既定 `true`）: 接続後に自動で `initial` ロードする。親が自分でオーケストレーションする場合は `false` にし、明示的に `refresh()` 等を呼ぶ
  - Combobox は二重 fetch 防止のため、内側 InfiniteScroll に `autoLoad = false` をセットする

## ソートとマージ

- 各 item のフィールド名でソートする（比較関数は受け取らない）
  - 属性／プロパティ例: `sort-key="updated_at"`
  - 昇順／降順: `sort-direction="asc" | "desc"`（未指定時は `desc`）
- 新規 `items` を既存ウィンドウ内容と **value で重複排除**したうえでマージし、`sort-key` で再ソートする（同一 value は新規側優先）
- `sortKey` が欠ける item は **末尾** に寄せる（例外なし）
- 時系列の前後に割り込む要素も、ソート結果どおりの位置に挿入する
- 再描画時はスクロール位置・アンカー要素を維持し、**がたつきを抑える**（具体アルゴリズムは実装時。仕様上の要件は「可能な限り自然な挿入・ソート」）

## 要素数制御（ウィンドウ）

- 上下にバッファを持つウィンドウ方式とする
- 最大保持件数は属性 `max-items`（未指定時は `100`）
- 純関数 `trimWindowItems` で `maxItems <= 0` のときは **空配列**（例外なし）。属性の不正値は既定 `100` にフォールバック
- ウィンドウから外れた端の要素は **破棄**する（下方向で溢れたときはソート先頭側＝上端から落とす）
- 破棄した方向へ再度スクロールしたら **再 fetch** する
- 仮想化（全件メモリ保持＋DOM のみ間引き）は対象外

## 振る舞い（概要）

1. 初期: `autoLoad` が true ならローダを `direction: 'initial'`（または相当）で呼び、結果をソートして表示。false なら親の明示呼び出し待ち
2. 下端付近: `direction: 'down'` で取得 → マージ／ソート → 必要なら上端を間引き
3. 上端付近: `direction: 'up'` で取得 → マージ／ソート → 必要なら下端を間引き
4. クエリ変更（親から通知）: ウィンドウをリセットし、初期取得し直す

## Combobox との接続

- Combobox は検索クエリ・mode・選択を担う
- リストのスクロール・ページ・ウィンドウ・マージは本基盤に委譲する
- `mode="static"` のとき本基盤は不要（クライアント配列をそのまま見せる）
- `async` / `hybrid` では本基盤をリスト領域に載せる
- Combobox は `autoLoad = false` をセットし、debounce／`loadOptions` 側で取得タイミングを制御する（二重 fetch 防止）

## 責務の境界

| 担当 | 内容 |
|---|---|
| InfiniteScroll | スクロール監視、ローダ呼び出し（`autoLoad`）、ウィンドウ、sortKey マージ、スクロール位置維持 |
| 親（Combobox 等） | クエリ、選択、ローダの配線、行の描画（Combobox は `renderOption`／本基盤は `renderItem`）、必要なら `autoLoad=false` |
| 利用側 | 実際の fetch、`sort-key` / `max-items` の指定 |

## 含まないもの

- 比較関数 `compare(a, b)` の受け取り
- 本格仮想スクロール（全件保持）
- a11y の本検討

----

以上
