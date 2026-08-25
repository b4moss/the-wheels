# Make ヘルパー

- **状態**: 仕様詳細
- **マイルストーン**: `v0.14.0`

npm workspace が `dev/` 配下になったため、リポジトリルートから `cd dev` せずに開発コマンドを叩けるようにする。FilePond とは独立。同じ版に同梱する。

## 含むもの

- リポジトリルートの `Makefile`
- `dev/package.json` の `scripts` を **すべて** 実行できること（追加漏れなし）
  - 現行: `dev:kitchen-sink` / `preview:kitchen-sink` / `dev:storybook` / `build:style` / `build:components` / `build:the-wheels` / `build:kitchen-sink` / `build:storybook` / `test:components` / `test:package` / `test:e2e`
- 実体は `dev/` で `npm run <script>` を呼ぶだけ（ビルド内容の再実装はしない）
- ターゲット名は npm script 名の `:` を `-` に置換する（Make の `:` 衝突を避ける）
  - 例: `npm run build:style` → `make build-style`
  - 例: `npm run test:e2e` → `make test-e2e`
- 対象ターゲットはすべて `.PHONY`

## 含まないもの

- `npm install` / `npm ci` の必須化（任意で足してよいが、本要件の対象は `npm run *` のみ）
- CI を Make 経由に切り替えること（GitHub Actions は引き続き `dev/` で `npm run`）
- 新しいビルドグラフや並列化

## 同期

`dev/package.json` に script を足したら、同じ版の PR で `Makefile` にも対応ターゲットを足す。片方だけ増やすのは受け入れない。

## 受け入れの目安

リポジトリルートで `make build-style` などが、`cd dev && npm run build:style` と同じ結果になること。現行 `scripts` の全件がターゲットとして存在する。

----

以上
