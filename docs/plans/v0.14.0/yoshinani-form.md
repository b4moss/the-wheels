# yoshinani-form subtree 取り込み

- **状態**: 方針確定
- **マイルストーン**: `v0.14.0`

form をモノレポへ載せる。

## 含むもの

- `git subtree` で履歴付き取り込み（パス案: `packages/yoshinani-form`）。ネスト `.git` は置かない
- workspaces / 最小の build・README 接続
- モノレポ内でパッケージとして触れる状態まで

## 含まないもの（この版の必須外）

- `@b4moss/the-wheels` への再エクスポートや深い API 統合
- SaaS スキャフォールド実装との本結合

## 未決（PO）

- 取り込み元 remote URL・ブランチ／タグ
- 入れ先パス
- 旧リポの archive 方針

----

以上
