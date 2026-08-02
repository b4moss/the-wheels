# コンポーネント: Dropdown 仕様書

- Web Component として実装する（Light DOM）
- JS クラス名: `TwDropdown`
- 内部は可能な限りセマンティックな要素で描画する
- a11y の詳細は v0.13.0 で検討。追加属性は可能な限り不要にする

## 振る舞い

- 発動領域をクリックすると、ドロップダウン領域が展開される
- 領域外クリックで、当該ドロップダウンが閉じる
- ポジショニング・ビューポート検知は Floating UI（`@floating-ui/dom`）を採用する
- デフォルトの placement は `bottom-start`
- `placement` 属性で変更可能
- Floating UI の flip / shift はデフォルトで有効（ビューポートに収まるよう自動調整）

## slot

- `trigger`（発動領域）
- `panel`（ドロップダウン領域）
- ユーザーが自由に中に要素を入れられるようにするため

----

以上
