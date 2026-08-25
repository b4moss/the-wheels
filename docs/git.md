# Git / GitHub 戦略（本リポの上書き）

共通ルールは [charter/git-rule.md](./charter/git-rule.md) と [charter/versioning-rule.md](./charter/versioning-rule.md)。  
このファイルは **the-wheels 固有の上書き**だけ書く。矛盾する場合は本ファイルを優先する。

パッケージ配信のため、charter の `staging` / `production` は使わない。`release` をプロダクション相当とする。

---

## ブランチ

| ブランチ | 役割 |
| --- | --- |
| `main` | 製品としての正。最新が安定版の最新 |
| `release` | `main` に入った内容のうち、npm 等へ公開するものを載せる。CD の起点 |
| `develop` | 開発の統合ブランチ。新規マイルストーンブランチの起点 |
| `dev-vX.Y.Z` | バージョン（マイルストーン）ブランチ。その版に入れると決まった作業の受け皿 |
| `feat-*` / `bugfix-*` / `enhance-*` / `doc-*` | 作業ブランチ（charter どおり） |
| `hotfix-*` | 緊急修正 |

- `main` には、すぐ `release` しない変更（ドキュメントのみ等）も入りうる
- `release` への取り込みは、公開したい `main` 上の状態に限る（原則 fast-forward または `main` の特定コミット）。`release` 独自の機能コミットは載せない
- `staging` / `production` は置かない

## PR の流れ

1. `develop` から `dev-vX.Y.Z` を作成する
2. 作業ブランチは原則 `dev-vX.Y.Z` から切る。PR 先も同ブランチ（hotfix 除く）
3. マイルストーン完了後 **`dev-vX.Y.Z` → `develop`**（**【PO作業】**）。CI 必須
4. **`develop` → `main`**（**【PO作業】**）
5. npm へ出すものは **`main` → `release`**（**【PO作業】**）

hotfix は `main`（公開済みなら必要に応じて `release`）から切り、`main` へマージしたあと、公開が必要なら `release`、開発線へは `develop`（必要なら現行 `dev-v*`）へ戻す。

作業ブランチの起点例外・force push（PO の GPG 署名付き、対象は `develop` / `main` / `release`）は charter どおり。

## タグ

- タグは `main` にマージされたコミットへ付ける（[versioning-rule.md](./charter/versioning-rule.md)）
- `dev-v*` / `develop` の tip には付けない
- `main` 上のタグは原則動かさない
- npm 公開の対象は、通常このタグ（またはそれ以降の `main` のうち PO が選んだもの）を `release` に載せる

## CI / CD

- PR CI: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
  - トリガー: `develop` / `dev-v*` への `pull_request`
  - Node.js 24 / `npm ci`（作業ディレクトリは `dev/`）
  - `permissions.contents: read` / concurrency（同一 PR は cancel-in-progress）
  - ジョブは `verify` と `e2e` を並列（`e2e` は `verify` を待たない。成果物も共有しない）
    - `verify`: `dev/` で `build:style` → `test:components` → `test:package` → `build:kitchen-sink` → `build:storybook`
    - `e2e`: `dev/` で `build:style` → `build:components` → `build:the-wheels` → `build:kitchen-sink` のあと Playwright（Chromium）。対象サーバは kitchen-sink の **`preview`**（ホスト `127.0.0.1`、ポート **5173**）
    - ローカルの `npm run test:e2e`（`dev/` で実行）は kitchen-sink の **`dev` サーバ** を対象にする
    - 変更パスがすべて `docs/**` または `*.md`（ルートの `README.md` 含む）なら `e2e` をスキップする

| 対象 | タイミング | 内容 |
| --- | --- | --- |
| `develop` / `dev-vX.Y.Z` への PR | PR 時 | CI。**`verify` が通らない PR は受け付けない** |
| 同上（`e2e`） | PR 時 | 走る。失敗でそのジョブは落ちる。required にするかは安定後（【PO作業】） |
| `release` への PR | PR 時 | **dry-run**（未実装） |
| `main` への PR / マージ | — | CI は走らせない |
| `release` へのマージ後 | CD | npm 等へのリリース（**未実装**。計画: [#47](https://github.com/b4moss/the-wheels/issues/47)） |

`develop` までに、対象変更について最低 1 回 `verify` が通ったことをもって、自動テストは行われたものとする。

### 【PO作業】ブランチ保護（required checks）

1. GitHub → Settings → Branches → Branch protection rules
2. `develop` に PR 必須 + status checks 必須。ジョブ名は当面 **verify**（`e2e` は安定したら required に上げる）
3. `dev-v*` にも同様（glob 非対応なら現行マイルストーンごとに追加）
4. `main` / `release` には、この PR CI を required にしない

## 関連

- 共通 git: [charter/git-rule.md](./charter/git-rule.md)
- ロードマップ: [roadmap.md](./roadmap.md)
- テスト上書き: [test.md](./test.md)

----

以上
