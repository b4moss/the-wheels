# コンポーネント: Dropdown 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwDropdown`
- 内部は可能な限りセマンティックな要素で描画する
- a11y の詳細は無期限延期（将来項目）。当面は必要最小限のみ。追加属性は可能な限り不要にする

## 振る舞い

- 発動領域をクリックすると、ドロップダウン領域が展開される
- 領域外クリックで、当該ドロップダウンが閉じる
- `Escape` で閉じる
- ポジショニング・ビューポート検知は Floating UI（`@floating-ui/dom`）を採用する
- デフォルトの placement は `bottom-start`
- `placement` 属性で変更可能
- Floating UI の flip / shift はデフォルトで有効（ビューポートに収まるよう自動調整）
- 純関数 `normalizePlacement` / `createDropdownMiddleware` も同パッケージから export する

## 属性

- `open`（真偽）: 開閉状態
- `placement`: Floating UI の placement（未指定・不正は `bottom-start`）

## メソッド

- `open()` / `close()` / `toggle()`
- `refreshSlots()`: slot 投影の再同期（親 WC が子を動かしたあと等）
- `getPlacement()`: 正規化後の placement 文字列

## slot

- `trigger`（発動領域）
- `panel`（ドロップダウン領域）
- ユーザーが自由に中に要素を入れられるようにするため

----

以上
