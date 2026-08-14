# SaaS スキャフォールド設計

- **状態**: 方針確定
- **マイルストーン**: `v0.15.0`

設計ドキュメントが成果物。アプリ実装コードは含めない。  
form 取り込み後に境界を固めるのが推奨（並行・入れ替えは PO 判断）。

## 含むもの

- 配置案（例: 将来 `apps/saas-scaffold`。本体パッケージとは版を分離しうる）
- レイアウト3種の責務
  - シンプル — ログイン画面等
  - ダッシュボード — header, sidebar, main, footer
  - 3column — main 領域がさらに 2 分割（メーラー等）
- 必要ページとレイアウトの対応表（ログイン、パスワード再発行、ダッシュボード、設定＋タブ、Sortable 等）
- the-wheels / yoshinani-form / scaffold の依存方向
- 不足コンポーネント・機能の洗い出し → 後続版または [unscheduled](../unscheduled/future-intents.md) へ転記
- Sortable.js 等は scaffold 側依存（コア WC に入れない）と明記

## 含まないもの

- scaffold の実装（設計と転記のみ。実装は将来項目）

----

以上
