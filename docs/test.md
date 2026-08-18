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
  - interaction / play は **v0.13.0 では入れない**（後続。[#40](https://github.com/b4moss/the-wheels/issues/40)）
- Playwright
  - kitchen-sink 上の E2E → **v0.13.0**（[#34](https://github.com/b4moss/the-wheels/issues/34)、仕様: [tests/v0.13.0.md](./tests/v0.13.0.md)）
  - アサートは振る舞いのみ（色・px・アニメ完了待ちは入れない）
  - ローカルは kitchen-sink の `dev`、CI は `preview`
  - CI は `verify` と `e2e` を分離。required は当面 `verify`（[git.md](./git.md)）
- スタイル（CSS）
  - 自動テストは行わない
  - 見た目は Storybook の手動レビュー（自動 VRT は未実施）

## テスト仕様書の置き場

charter のドメイン別 `docs/tests/{lib,...}/` は使わない。本リポは **版ごと 1 ファイル**:

- `docs/tests/vX.Y.Z.md`
- そのバージョンで実装するロジックをすべて載せる

書き方のフォーマットは charter に従う。

----

以上
