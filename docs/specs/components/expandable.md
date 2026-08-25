# コンポーネント: Expandable 仕様書

- Web Component（Light DOM）
- JS クラス名: `TwExpandable`
- タグ例: `tw-expandable` / `data-tw-component="expandable"`

## 振る舞い

- 内容はホスト配下（body 内）。折りたたみ中も DOM に残し、領域内スクロール
- 下部に内蔵トグルボタン
- 真偽属性 `open` で展開状態
- `collapsed-height` / `expanded-height`（CSS 長さ。expanded 未指定は内容高）
- `expand-label` / `collapse-label` でトグル文言上書き（既定: もっと見る / 閉じる）

## 含まないもの

- Accordion の高さ制限
- a11y 本検討

----

以上
