# コンポーネント: ActionMenu 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwActionMenu`
- いわゆる、縦向きスリードットをクリックしたら操作メニューが出てくるもの
  - 例: 編集 / 削除

## 組み合わせ

- Dropdown（開閉・配置）
- SVGLoader（トリガーアイコン）

## 属性

- `open`（真偽）: 開閉状態。内部 Dropdown と同期する
- `placement`: 内部 Dropdown に透過（未指定・不正は Dropdown 既定どおり `bottom-start`）
- `src`: デフォルトトリガーの SVG URL。未指定時は同梱 `more-vertical.svg`
  - 一覧は [icons.md](../icons.md) を参照
  - 定数 `MORE_VERTICAL_SRC` も export する

## メソッド

- `open()` / `close()` / `toggle()`
- `getDropdown()`: 内部 `TwDropdown`（テスト／デバッグ用）

## slot

| 名前 | 役割 |
|---|---|
| `trigger` | カスタム発動領域。無い場合はデフォルト（more-vertical アイコンの button）を生成する |
| （デフォルト） | メニュー項目。内部 Dropdown の panel へ投影 |

## トリガーアイコン

- デフォルト trigger はパッケージ同梱の `more-vertical.svg` を SVGLoader で表示する
- `src` 属性、または `slot="trigger"` で差し替え可能

## 振る舞い

- trigger クリックで toggle
- 外側クリック、`Escape` で閉じる
- **panel 内クリックで自動クローズ**

## メニュー項目

- デフォルト slot に項目を列挙する
- ユーザーが項目を自由に追加できるようにする

----

以上
