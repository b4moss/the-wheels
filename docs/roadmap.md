# the-wheels ロードマップ

npm 公開タイミングはバージョンに固定せず、PO が見計らう。  
各版のテスト仕様は `docs/specs/tests/vX.Y.Z.md`（その版のロジックをすべて載せる）。

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

### 前提

- v0.2.0〜v0.5.0 のコンポーネントが一通り揃っていること

---

## v0.8.0 — a11y の本検討

### 含むもの

- 各 WC のキーボード操作・フォーカス・ARIA の方針決定と実装
- 仕様書（各 `docs/specs/components/*.md`）への反映
- 必要ならカスタムイベント方針の再確認（`getEventName` の実利用開始）

### 前提

- セマンティックな内部描画は各版で済んでいる前提。ここで「追加属性を最小にする」方針を具体化する

---

## v0.9.0 — 安定化・品質

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
- 対応ブラウザ（最新2メジャー）での動作確認済み
- （PO 判断で）npm 公開

### 含まないもの（継続対象外のまま）

- フォーム（`yoshinani-form`）
- Card / ContentSection（必要になったら別バージョンで検討）
- 下記「将来項目」のコンポーネント（バージョン未定）

---

## 将来項目

バージョン未定。詳細仕様は後日。メモのみ。

- **UserMenu** — Avatar と Dropdown を組み合わせたもの
- **Combobox** — Dropdown をベースに拡張
- **CookieConsent** — 詳細は後ほど

---

## 横断方針

- TypeScript: `strict: true`
- 配布: ESM 主 + CJS dual package
- npm 公開: PO がタイミングを見計らう
- TDD: ロジックは Vitest。スタイル自動テストは行わず、見た目は Storybook で手動確認（自動 VRT は任意）
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
                           └─ v0.8.0 a11y
                                 └─ v0.9.0 安定化
                                       └─ v1.0.0
```

----

以上
