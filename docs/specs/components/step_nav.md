# コンポーネント: StepNav 仕様書

- Web Component（Light DOM）
- JS クラス名: `TwStepNav`
- タグ例: `tw-step-nav` / `data-tw-component="step-nav"`

## 振る舞い

- 表示のみ（パネル・次へ／戻る・クリック遷移なし）
- 子要素に `status` = `current` | `done` | `not_yet`
- `setCurrent(index)` は指定インデックスを `current` にするだけ（他 status は自動付け替えしない）

## 含まないもの

- `TwTabs` の利用
- a11y 本検討

----

以上
