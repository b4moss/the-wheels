# コンポーネント: Vertical Nav 仕様書

- 実体は **Vertical Nav Item**（リスト本体ではない）
- タグ名は `tw-vertical-nav`（短い名前を維持）
- JS クラス名: `TwVerticalNav`
- Web Component として実装する（Light DOM）
- a11y の詳細は v0.12.0 で検討。追加属性は可能な限り不要にする

## 役割

- 縦ナビの **1項目** を包む薄いラッパー
- リスト全体（`nav` / `ul` / `li`）は WC にせず、利用側が素の HTML で組む

## slot

- デフォルト slot に、インタラクティブ要素を **1つだけ**渡す
  - 例: `a` / `button` など
  - 列挙はしない（Item であるため）
- ホスト自身は `a` / `button` を描画しない
- 項目内にアイコンを置く場合は SVGLoader を利用する

## 振る舞い（初期）

- 現在地（アクティブ）は、利用側が slot 内要素に `aria-current="page"` を付ける
  - WC はそれを見てスタイル用の状態を同期する
- 初回実装はフラットのみ。ネスト（サブメニュー）は後日

## 利用イメージ

```html
<nav>
  <ul>
    <li>
      <tw-vertical-nav>
        <a href="/home" aria-current="page">Home</a>
      </tw-vertical-nav>
    </li>
  </ul>
</nav>
```

----

以上
