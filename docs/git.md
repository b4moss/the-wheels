# Git / GitHub 戦略

ブランチ・PR・タグ・CI/CD の運用方針。決定事項。変更する場合は本ドキュメントを更新する。

---

## ブランチ

| ブランチ | 役割 |
| --- | --- |
| `main` | 製品としての正。最新が安定版の最新 |
| `release` | `main` に入った内容のうち、npm 等へ公開するものを載せる。CD の起点 |
| `develop` | 開発の統合ブランチ。新規マイルストーンブランチの起点 |
| `dev-vX.Y.Z` | バージョン（マイルストーン）ブランチ。その版に入れると決まった作業の受け皿 |
| `feat-*` | 機能追加 |
| `bugfix-*` | バグ修正 |
| `enhance-*` | 既存機能の改修 |
| `doc-*` | ドキュメントの追加・更新 |
| `hotfix-*` | 緊急修正（後述） |

### 補足

- `main` には、すぐ `release` しない変更（ドキュメントのみ等）も入りうる
- `release` への取り込みは、公開したい `main` 上の状態に限る（原則 fast-forward または `main` の特定コミット）。`release` 独自の機能コミットは載せない

---

## PR の流れ

原則:

1. `develop` から `dev-vX.Y.Z` を作成する
2. 作業ブランチ（`feat-*` / `bugfix-*` / `enhance-*` / `doc-*`）は、**原則 `dev-vX.Y.Z` から切る**
3. hotfix を除き、作業ブランチの PR 先は **`dev-vX.Y.Z`**
4. マイルストーンが満たされたら **`dev-vX.Y.Z` → `develop` へ PR**（**【PO作業】**）
5. `develop` で問題なければ **`develop` → `main` へ PR・マージ**（**【PO作業】**）
6. npm 等へ出すものは、その後 **`main` → `release` へ PR・マージ**（**【PO作業】**）

### 作業ブランチの起点（例外）

原則は現行の `dev-vX.Y.Z` から切る。  
例外として、`develop` や過去のコミット／タグから切ることを認める（例: かなり古い開発時点のバグを、当時の状況で再現・修正したい場合）。その場合も **マージ先は原則として対象の `dev-vX.Y.Z`** とし、起点コミットを PR に明記する。

### hotfix

緊急修正:

1. `main`（公開済みの不具合なら、必要に応じて `release` 上の該当コミット）から `hotfix-*` を切る
2. 修正後、**`main` へ PR・マージ**（**【PO作業】**）
3. 公開が必要なら **`main` → `release`**（**【PO作業】**）し CD
4. 開発線へ戻すため **`develop` へも取り込む**（必要なら現行の `dev-vX.Y.Z` にも）

---

## タグ（`vX.Y.Z`）

- **バージョンタグは、該当マイルストーンが `main` にマージされたコミットに付ける**
- `dev-v*` や `develop` の tip には、今後は付けない
- `main` 上に付いたタグは **原則動かさない**（付け間違い時のみ、後述の force 例外）
- npm 公開の対象コミットは、通常このタグ（またはタグ以降の `main` のうち PO が選んだもの）を `release` に載せる

### 移行メモ

これ以前に `dev-v*` 上へ付いたタグ（例: `v0.8.0` / `v0.9.0`）がある。今後の新規タグから本ルールを適用する。既存タグの付け直しは必要になったときに PO 判断で行う。

`v0.11.0` / `v0.12.0` は `main` 上に付いている。workspace の `package.json` version は実装時に 0.10.0 のままだったため、現行コード（v0.12 込み）に合わせて **0.12.0** に揃えた。タグは動かさない。npm 公開は後続。

---

## CI / CD

実装マイルストーン: roadmap **v0.10.0**（CI 整備）。`release` dry-run / npm CD の本実装はその後続。

### ワークフロー

- PR CI: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
  - トリガー: `develop` / `dev-v*` への `pull_request`
  - Node.js 22 / `npm ci`
  - `build:style` → `test:components` → `test:package` → `build:kitchen-sink` → `build:storybook`
  - `permissions.contents: read` / concurrency（同一 PR は cancel-in-progress）

### CI が走るタイミング

| 対象 | タイミング | 内容 |
| --- | --- | --- |
| `develop` / `dev-vX.Y.Z` への PR | PR 時 | CI（テスト・ビルド等）。**通らない PR は受け付けない** |
| `release` への PR | PR 時 | **dry-run**（公開前確認。実際の npm publish はしない）。**v0.10.0 では未実装** |
| `main` への PR / マージ | — | CI は走らせない |
| `release` へのマージ後 | CD | npm 等へのリリース。**v0.10.0 では未実装** |

- `develop` までに、対象変更について最低 1 回 CI が通ったことをもって、自動テストは行われたものとする

### 【PO作業】ブランチ保護（required checks）

「通らない PR は受け付けない」を GitHub 上で強制するためのチェックリスト。設定操作は PO。

1. GitHub → Settings → Branches → Branch protection rules
2. `develop` にルールを追加（または更新）
   - Require a pull request before merging
   - Require status checks to pass before merging
   - 必須チェックに CI のジョブ名（現状: **verify**）を指定
   - （任意）Require branches to be up to date before merging
3. `dev-v*` にも同様の保護を付ける（ルールが glob 非対応なら、現行の `dev-vX.Y.Z` ごとに追加）
4. `main` / `release` には、この PR CI を required にしない（方針どおり CI 対象外／未実装）

### CD

- `release` へマージされたタイミングで、npm 等へリリースする（詳細パイプラインは別途整備）

---

## 例外（force push）

緊急時対応のため、**PO による GPG 署名付きコミットの force push のみ**許可する。対象:

- `develop`
- `main`
- `release`

通常の作業ブランチの force push 方針は、チーム運用に任せつつ、共有済み `dev-v*` では避ける。

---

## 関連

- ロードマップ・版の意味: [roadmap.md](./roadmap.md)
- テスト方針: [test.md](./test.md)
- プロジェクト概要: [main.md](./main.md)

----

以上
