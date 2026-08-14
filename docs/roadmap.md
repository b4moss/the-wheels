# the-wheels ロードマップ

npm 公開タイミングはバージョンに固定せず、PO が見計らう。  
各版のテスト仕様は `docs/specs/tests/vX.Y.Z.md`（その版のロジックをすべて載せる）。  
PO メモ・未決定の意図は [wishlist.md](./wishlist.md)。決定した版分けは本ドキュメントに転記する。

## 現状

workspace `version` は **0.12.0**。npm は未公開。出荷済みの仕様は [main.md](./main.md) と `docs/specs/`。

| 版 | 内容 | 状態 |
| --- | --- | --- |
| v0.13.0 | Playwright E2E | 次 |
| v0.14.0 | yoshinani-form subtree | 未着手 |
| v0.15.0 | SaaS スキャフォールド設計 | 未着手 |
| v0.16.0 | 安定化・品質 | 未着手 |
| v1.0.0 | 初回プロダクション想定 | 未着手 |

---

## v0.13.0 — Playwright E2E

自動テストの厚みを先に上げる。a11y 本検討より優先。

### 含むもの

- Playwright（Chromium）: kitchen-sink 上の振る舞い E2E
  - 開閉系（Modal / ActionMenu / UserMenu 等）
  - Combobox / InfiniteScroll
  - CookieConsent
  - Floating UI を手厚く（端配置・複数 placement・viewport 内収まり）
- Floating UI 用フィクスチャページ（kitchen-sink）
- テスト仕様: [v0.13.0.md](./specs/tests/v0.13.0.md)
- CI への実行配線（PR で落ちたらマージ不可）

### 含まないもの

- kitchen-sink 全ページの HTTP 200 / ナビ横断 smoke
- Storybook play / interaction（後続版）
- 自動 VRT・Chromatic 必須化
- a11y 本検討
- Firefox / WebKit（本版は Chromium のみ）

---

## v0.14.0 — yoshinani-form subtree 取り込み

form をモノレポへ載せる。

### 含むもの

- `git subtree` で履歴付き取り込み（パス案: `packages/yoshinani-form`）
- workspaces / 最小の build・README 接続
- モノレポ内でパッケージとして触れる状態まで

### 含まないもの（この版の必須外）

- `@b4moss/the-wheels` への再エクスポートや深い API 統合
- SaaS スキャフォールド実装との本結合

### 未決（PO）

- 取り込み元 remote URL・ブランチ／タグ、入れ先パス、旧リポの archive 方針

---

## v0.15.0 — SaaS スキャフォールド設計

設計ドキュメントが成果物。アプリ実装コードは含めない。form 取り込み後に境界を固めるのが推奨（並行・入れ替えは PO 判断）。

### 含むもの

- 配置案（例: 将来 `apps/saas-scaffold`。本体パッケージとは版を分離しうる）
- レイアウト3種の責務（シンプル / ダッシュボード / 3column）
- 必要ページとレイアウトの対応表（ログイン、パスワード再発行、ダッシュボード、設定＋タブ、Sortable 等）
- the-wheels / yoshinani-form / scaffold の依存方向
- 不足コンポーネント・機能の洗い出し → 後続版または将来項目へ転記
- Sortable.js 等は scaffold 側依存（コア WC に入れない）と明記

### 含まないもの

- scaffold の実装（設計と転記のみ）

---

## v0.16.0 — 安定化・品質

### 含むもの

- 分岐カバレッジの底上げ（v0.n 目標 50% からの引き上げを検討）
- Playwright / Storybook シナリオの穴埋め（Playwright 主戦場は v0.13.0。Storybook play や不足分はここで足してよい）
- API の破壊的変更の棚卸しと、1.0 に向けた凍結候補リスト

### 含まないもの

- a11y 本検討（無期限延期のまま）

---

## v1.0.0 — 初回プロダクション想定

### 含むもの（目安）

- style / components / the-wheels の公開面が安定
- README / 基本ドキュメントが利用可能な水準
- kitchen-sink がドキュメントサイトとして一通り使えること
- CI および Playwright E2E が PR で運用されていること。Storybook play は任意／後続
- 対応ブラウザ（最新2メジャー）での動作確認済み
- （PO 判断で）npm 公開

### この版で必須にしない

- SaaS スキャフォールドの**実装**（設計は v0.15.0）
- yoshinani-form の the-wheels 公式バンドル／深い統合（subtree 済みならリポ内にある状態で可）
- **a11y 本検討**（無期限延期）
- Card / ContentSection（必要になったら別バージョンで検討）
- 下記「将来項目」のうち未実施のもの

---

## 将来項目

バージョン未定。詳細仕様は後日。メモのみ。

### 無期限延期

- **a11y 本検討** — キーボード／フォーカス／ARIA の方針決定と実装、仕様書への本反映。再開時期は未定

### その他

- **Toast** — Snackbar レイヤの上に載せる。版未定
- **SaaS scaffold 実装** — v0.15.0 設計の後続（例: v1.1 または `apps/` サイド）
- **form × scaffold の本統合** — v0.14.0 取り込みの後続
- **ドキュメント用 別 SSG / CMS** — wishlist。後日
- **release dry-run / npm CD の本実装** — git.md

---

## 横断方針

- TypeScript: `strict: true`
- 配布: ESM 主 + CJS dual package
- npm 公開: PO がタイミングを見計らう
- TDD: ロジックは Vitest。見た目は Storybook 手動確認が基本。Playwright E2E は v0.13.0 で厚くする（Storybook play・自動 VRT は任意／後続）
- kitchen-sink: 動作確認に加え、ドキュメントサイト体裁のホスト
- Git / CI: [git.md](./git.md)
- a11y 本検討: 無期限延期（将来項目）
- ライセンス: MIT

---

## 依存関係（概略）

```text
v0.13.0 Playwright E2E
   ├─ v0.14.0 form subtree
   └─ v0.15.0 SaaS 設計
         └─ v0.16.0 安定化
               └─ v1.0.0
                 └─（後続）SaaS 実装 / form 深い統合 / Toast / a11y（延期解除時）
```

`v0.14` と `v0.15` は直列必須ではない（推奨は 14 → 15）。

----

以上
