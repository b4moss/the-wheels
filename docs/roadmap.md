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

## v0.10.0 — SaaS スキャフォールド設計

設計ドキュメントが成果物。アプリ実装コードは含めない。

### 含むもの

- 配置案（例: 将来 `apps/saas-scaffold`。本体パッケージとは版を分離しうる）
- レイアウト3種の責務（シンプル / ダッシュボード / 3column）
- 必要ページとレイアウトの対応表（ログイン、パスワード再発行、ダッシュボード、設定＋タブ、Sortable 等）
- the-wheels / yoshinani-form / scaffold の依存方向
- 不足コンポーネント・機能の洗い出し → 「将来項目」または後続版へ転記
- Sortable.js 等は scaffold 側依存（コア WC に入れない）と明記

### 含まないもの

- scaffold の実装、不足 WC の実装（設計と転記のみ）

### 補足

- v0.11.0（form subtree）と直列必須ではないが、境界設計が form に効くため **10 → 11 を推奨**。並行・入れ替えは PO 判断

---

## v0.11.0 — yoshinani-form subtree 取り込み

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

## v0.12.0 — a11y の本検討

旧計画の「v0.8.0 a11y」相当。DX・取り込みの後に実施する。

### 含むもの

- 各 WC のキーボード操作・フォーカス・ARIA の方針決定と実装
- 仕様書（各 `docs/specs/components/*.md`）への反映
- 必要ならカスタムイベント方針の再確認（`getEventName` の実利用開始）

### 前提

- セマンティックな内部描画は各版で済んでいる前提。ここで「追加属性を最小にする」方針を具体化する

---

## v0.13.0 — 安定化・品質

旧計画の「v0.9.0 安定化」相当。

### 含むもの

- 分岐カバレッジの底上げ（v0.n 目標 50% からの引き上げを検討）
- Playwright E2E の最小セット（kitchen-sink の主要導線）
- API の破壊的変更の棚卸しと、1.0 に向けた凍結候補リスト

---

## v1.0.0 — 初回プロダクション想定

### 含むもの（目安）

- MVP コンポーネント一式が仕様どおり揃っている
- style / components / the-wheels の公開面が安定
- README / 基本ドキュメントが利用可能な水準
- kitchen-sink がドキュメントサイトとして一通り使えること（v0.8〜v0.9）
- 対応ブラウザ（最新2メジャー）での動作確認済み
- （PO 判断で）npm 公開

### この版で必須にしない

- SaaS スキャフォールドの**実装**（設計は v0.10.0）
- yoshinani-form の the-wheels 公式バンドル／深い統合（subtree 済みならリポ内にある状態で可。README 案内は PO 判断）
- Card / ContentSection（必要になったら別バージョンで検討）
- 下記「将来項目」のコンポーネント（バージョン未定）

---

## 将来項目

バージョン未定。詳細仕様は後日。メモのみ。v0.10.0 設計で優先が上がったら版を切る。

- **UserMenu** — Avatar と Dropdown を組み合わせたもの
- **Combobox** — Dropdown をベースに拡張
- **CookieConsent** — 詳細は後ほど
- **Tabs 等** — SaaS 設計の不足リスト由来（洗い出し後に追加）
- **SaaS scaffold 実装** — v0.10.0 設計の後続（例: v1.1 または `apps/` サイド）
- **form × scaffold の本統合** — v0.11.0 の後続
- **ドキュメント用 別 SSG / CMS** — wishlist。後日

---

## 横断方針

- TypeScript: `strict: true`
- 配布: ESM 主 + CJS dual package
- npm 公開: PO がタイミングを見計らう
- TDD: ロジックは Vitest。スタイル自動テストは行わず、見た目は Storybook で手動確認（自動 VRT は任意）
- kitchen-sink: 動作確認に加え、ドキュメントサイト体裁のホスト（v0.9.0〜）
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
                                       ├─ v0.10.0 SaaS 設計 ──→（不足 WC は将来項目へ）
                                       ├─ v0.11.0 form subtree
                                       └─ v0.12.0 a11y
                                             └─ v0.13.0 安定化
                                                   └─ v1.0.0
                                                         └─（後続）SaaS 実装 / form 深い統合 / 将来 WC
```

`v0.10` と `v0.11` は直列必須ではない（推奨は 10 → 11）。

----

以上
