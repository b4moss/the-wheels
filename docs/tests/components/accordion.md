# TwAccordion テスト仕様

関連仕様: [specs/components/accordion.md](../../specs/components/accordion.md)  
共通前提: [tests/e2e.md](../e2e.md)

- ネイティブ `details` / `summary` で 1 ホスト 1 パネルを開閉する
- header（`summary`）操作で content の表示が切り替わる

対象ページ: `/accordion/`（Tabs ではなく Accordion を代表とする）

## テスト：正常系

- 閉じた状態で header をクリックすると開く（`open` 属性）
- 開いた状態で header をクリックすると閉じる
- 開閉後もホストが例外なく操作可能である

## テスト: 異常系

- 連続クリックしても例外なく `open` 状態が追従する
- 閉じた状態での連続クリックでもページが落ちない

----

以上
