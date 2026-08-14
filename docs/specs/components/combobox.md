# コンポーネント: Combobox 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwCombobox`
- タグ例: `tw-combobox`（接頭辞は総則どおり `setPrefix` で変更可）
- 内部は可能な限りセマンティックな要素で描画する
- a11y の詳細は無期限延期（将来項目）。当面は必要最小限のみ。追加属性は可能な限り不要にする
- 参照実装（意図の資料）: [docs/resources/combobox/](../../resources/combobox/)

## 目的

- テキスト検索を本懐とする、Dropdown 上の選択肢 UI
- リスト供給は静的配列・非同期 fetch・その併用を `mode` で明示する
- 見た目の多く（トリガー・タグ・サブフィルタ）は利用側スロットに、行は `renderOption` に任せ、WC は値・検索・取得オーケストレーションに徹する

## 組み合わせ

- **Dropdown**（開閉・領域外クリック・Floating UI 配置）を土台に拡張する
- **InfiniteScroll**（[infinite_scroll.md](./infinite_scroll.md)）— 上下無限スクロール・ウィンドウ・sortKey マージ。`async` / `hybrid` ではリスト領域に載せる

## mode

属性 `mode` で供給方法を明示する。未指定時は `static`。

| 値 | 意味 |
|---|---|
| `static` | `options`（メモリ内配列）のみ。検索はクライアント側フィルタ |
| `async` | `loadOptions`（または第2経路）のみ。検索・ページはサーバー／利用側取得 |
| `hybrid` | 静的 `options` と `loadOptions` を併用。取得結果のマージ／再ソートは InfiniteScroll の規則に従う |

## 選択肢データ

### Option 形（論理）

- 少なくとも `value`（`string | number`）と `label`（`string`）を持つ
- `disabled` は任意
- InfiniteScroll 接続時は、ソート用フィールド（`sortKey` で指すプロパティ）を item に含める（欠けるとソート末尾へ）

### 静的 options

- JS プロパティ `options` で配列を渡す（属性への巨大 JSON は必須にしない）

## 非同期取得（loadOptions）

Combobox が debounce・loading・ページ結合のオーケストレーションを持つ（取得の中身は利用側）。

### 主経路: JS プロパティ

```ts
el.loadOptions = async (ctx) => {
  // ctx: { query, page, signal, direction? }
  return { items, hasMore, nextPage? }
}
```

- `signal`: `AbortSignal`（連続検索・競合時に中断）
- 戻りはメタ付きオブジェクトとする（空配列だけに頼らない）
  - `items`: 追加／置換対象の Option 配列
  - `hasMore`: 続きがあるか
  - `nextPage`: 次ページ識別子（省略時は基盤／Combobox が採番してよい）

### 第2経路: フレームワークラッパー向け

- 総則の既定はカスタムイベントなし。本コンポーネントは非同期供給のため **例外**として次を許可する
  - リクエスト: カスタムイベント（名称は `getEventName('load-request')` に乗せる）
  - レスポンス: ホストメソッド（例: `applyLoadResult(result)`）で結果を返す
- 利用は `loadOptions` 未設定時のフォールバックとする。**プロパティを主**とする
- `applyLoadResult` が呼ばれない場合は、**次の microtask** で loading を解除し空結果とする

### debounce

- 検索入力に debounce を入れる
- デフォルト: `300`（ms）
- 属性例: `debounce="300"`（変更可）
- `static` でも検索 UI はあるが、クライアントフィルタは即時でもよい（debounce は主に `async` / `hybrid` の fetch 抑制用。実装はモードに応じて適用してよい）

## 選択（値モデル）

- 単一: `value` にスカラー（未選択は空／`null` 相当）
- 複数: 真偽属性 `multiple`。値は配列
- 上限: 任意属性 `max-selected`（複数時）
- 値の更新はホストプロパティ／属性と、`change` イベント（バブリング可）。選択用の独自カスタムイベントは発火しない
- **トリガー上の選択表示（ラベル・タグ等）はスロット必須**。WC は値の保持・更新のみ行い、組み込みのタグ UI は持たない

## テキスト検索

- パネル内に検索フィールドを持つ（Combobox の本懐）
- 検索クエリは内部状態。必要ならプロパティで読み取り可能にする
- `static`: クエリで `options` をフィルタしてリスト表示
- `async` / `hybrid`: debounce 後に `loadOptions`（または第2経路）を呼ぶ

## リスト表示

### デフォルト行

- 各 option の `label` をテキスト表示する
- 選択中の視覚（チェック等）は最小限でよい

### 行の差し替え

- JS プロパティ `renderOption(option, selected)` でオプション行全体を差し替える（スロット／テンプレートではない）
- 未設定時は上記デフォルト行。アイコン・色チップ等は利用側が `renderOption` で組み立てる

### mode ごとのリスト実装

- `static`: 取得済み／フィルタ済み配列を単純リスト表示する（InfiniteScroll は使わない）
- `async` / `hybrid`: リスト領域に InfiniteScroll を載せる
- Combobox は内側 InfiniteScroll の `autoLoad` を **false** にする（Combobox 側の debounce／`loadOptions` オーケストレーションと二重 fetch しないため）。詳細は [infinite_scroll.md](./infinite_scroll.md)

### InfiniteScroll への委譲（async / hybrid）

- 上下 fetch・ウィンドウ・sortKey マージは InfiniteScroll に委譲する
- 詳細は [infinite_scroll.md](./infinite_scroll.md)

## サブエリア（カテゴリ／タグ絞り込み等）

- Combobox は **スロット（拡張ポイント）のみ**提供する
- AND / OR やタグ UI・絞り込み論理は **利用側の責務**
- スロット位置は検索フィールドとリストのあいだを想定する

## slot

| 名前 | 役割 |
|---|---|
| `trigger` | 発動領域の中身（選択表示はここに書く） |
| `subarea` | 検索とリストのあいだの拡張（カテゴリ等） |
| `footer` | パネル下部の任意アクション |
| （Dropdown 由来） | 開閉・パネル骨格は Dropdown の構造を踏襲 |

オプション行の差し替えはスロットではなく、JS プロパティ `renderOption` を使う。

`trigger` は必須運用（空でも開閉はできるが、選択の可視化は利用側任せ）。

## パネル構成（上から）

1. 検索フィールド
2. `subarea` スロット
3. リスト（loading 表示を含む）
4. `footer` スロット

## その他属性・状態（最小）

- `disabled`（真偽）
- `placeholder`（検索入力の placeholder に反映）
- `placement` 等は Dropdown に準拠
- loading 中はリスト領域に読み込み表示
- 静的検索の一致は、大文字小文字を無視した label の部分一致を既定とする

## 責務の境界

| 担当 | 内容 |
|---|---|
| Combobox | 検索 UI、mode、選択値、debounce、`loadOptions` 呼び出し、Dropdown 開閉／位置、スロット出口、`renderOption` |
| InfiniteScroll | 上下 fetch トリガ、ウィンドウ、sortKey マージ、がたつき抑制（`autoLoad` 既定 true。Combobox 利用時は false） |
| 利用側 | fetch 実装、サブフィルタ、トリガー／行／タグの見た目、`sortKey`・窓サイズ・debounce の指定、`renderOption` |

## 含まないもの

- a11y の本検討
- 組み込みのカテゴリ AND/OR UI
- 組み込みの ColorTip / Avatar / 複数カラムグリッド（参照実装にあった見た目特化）
- 組み込みの複数選択タグ UI（スロットで足りる）

----

以上
