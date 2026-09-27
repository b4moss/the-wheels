# TwActionMenu テスト仕様

関連仕様: [specs/components/action_menu.md](../../specs/components/action_menu.md)  
共通前提: [tests/e2e.md](../e2e.md)

- トリガーをクリックすると panel が開く
- 領域外クリック・`Escape`・項目クリックで閉じる
- 開いた状態で再度トリガーをクリックすると閉じる（toggle）

対象ページ: `/action-menu/`（UserMenu は必須としない）

## テスト：正常系

- trigger クリックで panel が開く（`open` 属性または可視 panel）
- 外側クリックで閉じる
- `Escape` で閉じる
- panel 内の項目クリックで閉じる

## テスト: 異常系

- 閉じた状態で `Escape` しても何も壊れない
- 開いた状態で再度 trigger をクリックすると閉じる
- 開閉を連続しても例外なく状態が追従する

## TwActionMenu（端フィクスチャ）

- Dropdown と同じ Floating UI 配置を ActionMenu でも使う
- 端付近のフィクスチャで、開閉と項目クリックができる

対象ページ: `/dropdown-placement/`

### テスト：正常系

- 端フィクスチャの ActionMenu を開ける
- 開いた panel が viewport に対して大きくはみ出さない
- 項目クリックで閉じる

### テスト: 異常系

- 複数の端フィクスチャを連続開閉しても例外なし
- 閉じたあと再オープンしても再び収まって見える

----

以上
