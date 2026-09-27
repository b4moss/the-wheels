# E2E テスト仕様

Playwright による kitchen-sink 上の E2E（Chromium）。  
Vitest でカバー済みの単体分岐は重複させない。

関連: [specs/e2e.md](../specs/e2e.md) / [test.md](../test.md) / [components/](./components/)

## 共通前提

- ローカルは kitchen-sink の `dev`、CI は `preview`
- セレクタは `data-tw-component` とデモの安定 ID／`data-tw-*` を優先する。文言マッチは最小限
- アサートは振る舞いのみ（表示／非表示、開閉、件数の増減、storage の状態）。色・px・アニメ完了待ちは入れない
- Floating UI の座標厳密一致はしない。panel の矩形が viewport に対して大きくはみ出さないこと（各辺のはみ出し 8px 未満）で判定する

## test:e2e

- `dev/` で `npm run test:e2e` して本仕様のシナリオを実行する
- CI では `e2e` ジョブが Playwright（Chromium）を kitchen-sink `preview` に対して走らせる
- 変更パスがすべて `docs/**` または `*.md`（ルートの `README.md` 含む）なら `e2e` をスキップする

### テスト：正常系

- `dev/` で `npm run test:e2e` が kitchen-sink `dev` サーバを対象に本仕様のシナリオを実行できる
- CI の `e2e` ジョブが `preview` を対象に走り、失敗でそのジョブは落ちる
- 変更パスがすべて `docs/**` または `*.md` なら `e2e` をスキップする

### テスト: 異常系

- フレーク対策に `expect` の auto-wait／明示 wait を使う。固定 `waitForTimeout` の多用は避ける
- required check は当面 `verify` とする（`e2e` を required にするかは PO）

## 対象外（自動テストに含めない）

- kitchen-sink 全ページの HTTP 200 / ナビ横断 smoke
- Storybook play / interaction / 自動 VRT
- CSS の色・影・フォントのピクセル一致
- Floating UI の「期待 placement どおりのピクセル座標」厳密一致
- Firefox / WebKit（現行は Chromium のみ）
- a11y 本検討
- npm 公開
- UserMenu 専用ケース（ActionMenu で充足）
- Combobox disabled（デモが無い場合は対象外）

----

以上
