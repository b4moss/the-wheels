# the-wheels ロードマップ

npm 公開タイミングはバージョンに固定せず、PO が見計らう。  
各版のテスト仕様は `docs/specs/tests/vX.Y.Z.md`（その版のロジックをすべて載せる）。  
PO メモ・未決定の意図は [wishlist.md](./wishlist.md)。決定した版分けは本ドキュメントに転記する。

---

## v0.1.0 — スタイル土台

スタイルのみ。リポジトリ内で利用可能な状態まで。

### 含むもの

- `@b4moss/the-wheels-style`
  - reset（`reset-css`）
  - フォント stack（Inter + Noto Sans JP。フォント本体は同梱しない）
  - ルート文字サイズは 62.5% 方式
  - デザイントークン（参照のユースケース色を踏襲し `--tw-` 接頭辞へ）
  - Typography（長文は `max-width: 40ch`）
  - focus / breakpoints
  - `@layer`: `reset` / `tokens` / `base` / `components`（`components` は空でよい）
  - ソースは layer / 関心ごとに分割
  - 公開エントリ: 全部入り + 部分 import（`/css/tokens` などカテゴリ付き）
- workspaces 用に `components` / `the-wheels` パッケージも用意（中身はほぼ空）
- `apps/kitchen-sink`（Vituum MPA）
  - 関心ごとの複数ページ（例: `/`, `/typography`, `/tokens`）

### 含まないもの

- Web Components の実装
- スタイルに対する自動テスト（見た目確認は Storybook 手動レビュー。自動 VRT は任意）
- npm 公開

詳細: [スタイル仕様](./specs/style.md) / [main.md](./main.md)

---

## v0.2.0 — SVGLoader / Spinner / Button

コンポーネント実装の入口。基盤 API もここで入れる。

### 含むもの

- 基盤
  - `setPrefix` / import 時自動登録（デフォルト `tw-`）
  - `data-tw-component` 付与
  - `getEventName`（将来用。この版ではカスタムイベント未使用）
- `@b4moss/the-wheels-components`
  - SVGLoader（fetch、失敗時プレースホルダ、HTTP キャッシュ依存）
  - Spinner（同梱 SVG + SVG アニメーション、デフォルト `1em`）
  - Button（`variant` / `disable-on-click` / `reset()` / slot）
- 同梱アセット: `packages/components/assets/`（詳細は [icons.md](./specs/icons.md)）
  - 出典: `@tabler/icons`（MIT）。`sync:icons` で再取得可
  - `spinner`, `more-vertical`, `close`, `menu`, `check`, `chevron`（rotate で開閉）, `lock`
  - これ以外は同梱しない
- style: Button / Spinner 用の `components` レイヤーを追加
- kitchen-sink: 上記コンポーネントの確認ページ
- Vitest: ピュアロジック中心（TDD。スタイル自動テストはしない）

### 依存

- v0.1.0 のスタイル土台

---

## v0.3.0 — Dropdown / ActionMenu

### 含むもの

- Dropdown（Floating UI、`placement` デフォルト `bottom-start`、flip/shift 有効、slot: `trigger` / `panel`）
- ActionMenu（Dropdown + 同梱三本点 SVG、項目はデフォルト slot、クリックで自動クローズ）
- style: Dropdown / ActionMenu 用スタイル
- kitchen-sink: 確認ページ追加

### 依存

- v0.2.0（SVGLoader / Button 系）

---

## v0.4.0 — Accordion / Modal

### 含むもの

- Accordion（1ホスト=1パネル、`details`/`summary`、一斉開閉用 `data-tw-accordion-*`）
- Modal（内部 `<dialog>` + `showModal()` / `close()`、× は同梱 SVG、`data-tw-modal-close`）
- style: Accordion / Modal 用スタイル
- kitchen-sink: 確認ページ追加

### 依存

- v0.2.0（SVGLoader）。Modal の × アイコン用

---

## v0.5.0 — Avatar / Vertical Nav

### 含むもの

- Avatar（`image-path` / 書記素クラスタ / WCAG コントラスト）
- Vertical Nav（実体は Item。タグ `tw-vertical-nav`。リストは素の HTML）
- style: 上記 + レイアウト最低限（container / sidebar 等。Item のデモ用）
- kitchen-sink: ナビ＋アバターの確認ページ

### 依存

- v0.1.0〜。アイコン併記なら SVGLoader（v0.2.0）

---

## v0.6.0 — 全部入りパッケージの実用化

### 含むもの

- `@b4moss/the-wheels` が style + components を正しく再エクスポート
- 利用ドキュメントの最低限（README: 導入、`setPrefix`、kitchen-sink の見方）
- パッケージ exports / dual package（ESM + CJS）の通し確認

### ゴールイメージ

- 社内プロジェクトから「全部入り」で試し導入できる状態

---

## v0.7.0 — Storybook

### 含むもの

- `apps/storybook` 導入
- 主要コンポーネントのカタログ
- スタイル／見た目の検証方針の再検討（自動 VRT は任意）
- Bug 修正: [Issue #6](https://github.com/b4m-oss/the-wheels-reconstruct/issues/6) — Button `disable-on-click` クリック直後の横幅シュリンク
- Spinner 開始フリーズ回避（同梱 `spinner.svg` を SMIL から SVG 内 CSS `@keyframes` へ）

### 前提

- v0.2.0〜v0.5.0 のコンポーネントが一通り揃っていること

---

## v0.8.0 — kitchen-sink Twig 化

Vituum を維持したまま、テンプレートを Twig にする。以降のドキュメント体裁の土台。

### 含むもの

- `@vituum/vite-plugin-twig`（または同等）の導入
- 共通 layout / partial（head、ナビ、fonts、style / JS 読込）
- 既存ページの Twig 移行（URL・trailing slash 互換を維持）
- `dev:kitchen-sink` / `build:kitchen-sink` の通し

### 含まないもの

- ドキュメントサイトとしての情報設計・FV の作り込み（v0.9.0）
- 別 SSG / CMS

### 依存

- v0.7.0 まで完了していること

---

## v0.9.0 — ドキュメントサイト体裁（kitchen-sink 拡張）

kitchen-sink を「読めるドキュメントサイト」として体裁を整える。別 SSG はまだ導入しない。

### 含むもの

- トップ（FV。アセットは参照リポ由来またはプレースホルダ。PO 判断）
- 共通ナビの統一、Getting Started（install / `setPrefix` / style）
- Components 一覧から各デモへの導線
- Storybook との役割分けの明記（説明・導線 = kitchen-sink、カタログ = Storybook）

### 含まないもの

- 別 SSG / CMS（wishlist・後日）
- SaaS スキャフォールド実装

### 依存

- v0.8.0（Twig）

---

## v0.10.0 — CI 整備

Git / GitHub 戦略（[git.md](./git.md)）に沿った CI を、次の実装として割り込む。以降のマイルストーンは一つずつ繰り下げ。

### 含むもの

- `develop` / `dev-vX.Y.Z` への PR 時に走る CI（テスト・ビルド等）。通らない PR はマージ不可とする運用の土台
- モノレポ向けワークフロー（例: GitHub Actions）。最低限 `test:components` / 必要なら `test:package` / 主要 `build:*` を含む
- 方針ドキュメント（[git.md](./git.md)）との整合確認

### 含まないもの（この版の必須外）

- `release` 向け dry-run / npm CD の本実装（git.md 上は後続。必要なら最小スタブまで）
- `main` への CI（方針どおり走らせない）

### 依存

- v0.9.0 まで完了していること
- ブランチ／PR 方針は [git.md](./git.md) を正とする

---

## v0.11.0 — 追加コンポーネント

CI の次に、コンポーネント拡充を先に進める。候補は「将来項目」から取り上げ、版内でテスト仕様を切って実装する。

### 含むもの（候補・詳細は版着手時に確定）

- **UserMenu** — Avatar + Dropdown
- **Combobox** — Dropdown ベースの拡張
- **CookieConsent** — 詳細は版内仕様で詰める
- 必要なら Tabs の不足分（`TwTabs` 最小は v0.9 系で先行済み）
- 各 WC の style / kitchen-sink / Storybook への反映
- Vitest（TDD）

### 含まないもの

- a11y の本検討（無期限延期・将来項目）
- SaaS スキャフォールド実装

### 依存

- v0.10.0（CI）まで完了していること

---

## v0.12.0 — Playwright / Storybook テストシナリオ

自動テストの厚みを先に上げる。a11y 本検討より優先。

### 含むもの

- Playwright: kitchen-sink の主要導線の最小〜実用セット（開閉・ナビ・代表コンポーネント）
- Storybook: 主要ストーリーに対するテストシナリオ（interaction / play または同等。自動 VRT は任意のまま）
- CI（v0.10.0）からの実行配線（PR で落ちたらマージ不可、の運用に載せる）

### 含まないもの

- a11y 本検討
- Chromatic 等の有料 VRT 必須化（任意）

### 依存

- v0.11.0 の追加コンポーネントが一通り入っていることが望ましい（シナリオ対象が増える）。並行は PO 判断

---

## v0.13.0 — yoshinani-form subtree 取り込み

form を先にモノレポへ載せる（旧「v0.11 / v0.12 入れ替え」後の form 側）。

### 含むもの

- `git subtree` で履歴付き取り込み（パス案: `packages/yoshinani-form`）
- workspaces / 最小の build・README 接続
- モノレポ内でパッケージとして触れる状態まで

### 含まないもの（この版の必須外）

- `@b4moss/the-wheels` への再エクスポートや深い API 統合
- SaaS スキャフォールド実装との本結合

### 前提（PO）

- 取り込み元 remote URL・ブランチ／タグ、入れ先パス、旧リポの archive 方針

---

## v0.14.0 — SaaS スキャフォールド設計

設計ドキュメントが成果物。アプリ実装コードは含めない。form 取り込み後に境界を固める。

### 含むもの

- 配置案（例: 将来 `apps/saas-scaffold`。本体パッケージとは版を分離しうる）
- レイアウト3種の責務（シンプル / ダッシュボード / 3column）
- 必要ページとレイアウトの対応表（ログイン、パスワード再発行、ダッシュボード、設定＋タブ、Sortable 等）
- the-wheels / yoshinani-form / scaffold の依存方向
- 不足コンポーネント・機能の洗い出し → 後続版または将来項目へ転記
- Sortable.js 等は scaffold 側依存（コア WC に入れない）と明記

### 含まないもの

- scaffold の実装（設計と転記のみ）

### 補足

- v0.13.0（form subtree）の後が推奨。並行・入れ替えは PO 判断

---

## v0.15.0 — 安定化・品質

### 含むもの

- 分岐カバレッジの底上げ（v0.n 目標 50% からの引き上げを検討）
- Playwright / Storybook シナリオの穴埋め（主戦場は v0.12.0。ここで不足分を足す）
- API の破壊的変更の棚卸しと、1.0 に向けた凍結候補リスト

### 含まないもの

- a11y 本検討（無期限延期のまま）

---

## v1.0.0 — 初回プロダクション想定

### 含むもの（目安）

- MVP コンポーネント一式が仕様どおり揃っている（v0.11.0 の追加分を含む）
- style / components / the-wheels の公開面が安定
- README / 基本ドキュメントが利用可能な水準
- kitchen-sink がドキュメントサイトとして一通り使えること（v0.8〜v0.9）
- CI および Playwright / Storybook シナリオが PR で運用されていること（v0.10〜v0.12）
- 対応ブラウザ（最新2メジャー）での動作確認済み
- （PO 判断で）npm 公開

### この版で必須にしない

- SaaS スキャフォールドの**実装**（設計は v0.14.0）
- yoshinani-form の the-wheels 公式バンドル／深い統合（subtree 済みならリポ内にある状態で可）
- **a11y 本検討**（無期限延期）
- Card / ContentSection（必要になったら別バージョンで検討）
- 下記「将来項目」のうち未実施のもの

---

## 将来項目

バージョン未定。詳細仕様は後日。メモのみ。

### 無期限延期

- **a11y 本検討** — キーボード／フォーカス／ARIA の方針決定と実装、仕様書への本反映。先に追加コンポーネントと自動テストシナリオを優先するため、再開時期は未定

### その他

- **UserMenu / Combobox / CookieConsent** — v0.11.0 で着手予定。残ればここに戻す
- **SaaS scaffold 実装** — v0.14.0 設計の後続（例: v1.1 または `apps/` サイド）
- **form × scaffold の本統合** — v0.13.0 取り込みの後続
- **ドキュメント用 別 SSG / CMS** — wishlist。後日
- **release dry-run / npm CD の本実装** — git.md。v0.10.0 の必須外の残り

---

## 横断方針

- TypeScript: `strict: true`
- 配布: ESM 主 + CJS dual package
- npm 公開: PO がタイミングを見計らう
- TDD: ロジックは Vitest。見た目は Storybook 手動確認が基本。Playwright / Storybook シナリオは v0.12.0 で厚くする（自動 VRT は任意）
- kitchen-sink: 動作確認に加え、ドキュメントサイト体裁のホスト（v0.9.0〜）
- Git / CI: [git.md](./git.md)（v0.10.0 で CI 整備）
- a11y 本検討: 無期限延期（将来項目）
- ライセンス: MIT

---

## 依存関係（概略）

```text
v0.1.0 style
   └─ v0.2.0 SVGLoader → Spinner → Button
         ├─ v0.3.0 Dropdown → ActionMenu
         ├─ v0.4.0 Accordion / Modal
         └─ v0.5.0 Avatar / Vertical Nav
               └─ v0.6.0 umbrella 実用化
                     └─ v0.7.0 Storybook
                           └─ v0.8.0 Twig
                                 └─ v0.9.0 ドキュメント体裁
                                       └─ v0.10.0 CI 整備
                                             └─ v0.11.0 追加コンポーネント
                                                   └─ v0.12.0 Playwright / Storybook シナリオ
                                                         ├─ v0.13.0 form subtree
                                                         └─ v0.14.0 SaaS 設計
                                                               └─ v0.15.0 安定化
                                                                     └─ v1.0.0
                                                                           └─（後続）SaaS 実装 / form 深い統合 / a11y（延期解除時）
```

`v0.13` と `v0.14` は直列必須ではない（推奨は 13 → 14）。

----

以上
