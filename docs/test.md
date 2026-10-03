# the-wheels テスト方針（本リポの上書き）

共通ルール（TDD、氷山パターン、カバレッジ目安 50%、テスト仕様書の書き方、Red → Green → Refactor）は [charter/tdd.md](./charter/tdd.md)。  
このファイルは **the-wheels 固有の上書き**だけ書く。矛盾する場合は本ファイルを優先する。

薄い DDD / DB テスト / Repository 層は、本リポでは対象外（パッケージのため。charter README の「CLI・パッケージ」どおり）。

## テストの分類

- Vitest
  - 単体テスト: 単一のロジック
  - 結合テスト: 複数のロジックがまとまったもの
- Storybook
  - コンポーネント・カタログと手動の見た目確認
  - 自動 VRT は当面行わない
  - interaction / play は入れない（後続。計画: [#40 安定化・品質](https://github.com/b4moss/the-wheels/issues/40)）
- Playwright
  - kitchen-sink 上の E2E（現行: [specs/e2e.md](./specs/e2e.md)、ケース: [tests/e2e.md](./tests/e2e.md) / [tests/components/](./tests/components/)）
  - アサートは振る舞いのみ（色・px・アニメ完了待ちは入れない）
  - ローカルは kitchen-sink の `dev`、Actions 手動実行は `preview`
  - PR CI は `verify` のみ（e2e は毎回回さない）。PR 前に手元で `npm run test:e2e` / `make test-e2e`。必要なら Actions の `workflow_dispatch`（[git.md](./git.md)）
- スタイル（CSS）
  - 自動テストは行わない
  - 見た目は Storybook の手動レビュー（自動 VRT は未実施）

## テスト仕様書の置き場

`docs/specs/` と**同じドメイン切り**（OKF v0.1 / [doc-rule](./charter/doc-rule.md)）:

- `docs/tests/e2e.md` — E2E 共通前提・実行・対象外
- `docs/tests/components/` — コンポーネント別 E2E ケース（[specs/components/](./specs/components/) に対応）
- SemVer フォルダ（`vX.Y.Z/`）や版ごと 1 ファイルは使わない（履歴は [_archived/tests/](./_archived/tests/)）

書き方のフォーマットは charter に従う。

----

以上
