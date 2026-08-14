# ウィッシュリスト

PO のメモ書き。決定事項は各ドキュメント（特に [roadmap.md](./roadmap.md)）に転記する。

- **UserMenu / CookieConsent** → roadmap **v0.12.0**
- **Playwright E2E** → roadmap **v0.13.0**
- **アプリ・配信・統合の意図** → 本ファイル。版が決まったら roadmap のマイルストーンへ

## 優先順位（確定）

1. Twig → **v0.8.0**（済）
2. ドキュメントサイト体裁 → **v0.9.0**（済）
3. CI 整備 → **v0.10.0**（済）
4. 追加コンポーネント（Combobox / InfiniteScroll）→ **v0.11.0**
5. UserMenu / CookieConsent → **v0.12.0**
6. Playwright E2E（Floating UI 手厚め）→ **v0.13.0**（Storybook play は後続）
7. yoshinani-form subtree → **v0.14.0**
8. SaaS スキャフォールド設計 → **v0.15.0**（実装は将来項目）
9. a11y 本検討 → **無期限延期**（将来項目）

詳細な含むもの／含まないものは roadmap を正とする。

## メモ（判断保留）

コードを正としてドキュメントを直したときの残り。版が決まったら roadmap へ、不要なら削除する。

- **`dev-v0.13.0` ブランチ** — Playwright E2E（kitchen-sink）の着手コミットがある。`main` には未マージ。取り込むか、仕様書を書いてからやり直すかは **PO 判断**
- **Git タグと package version** — タグ `v0.11.0` / `v0.12.0` は既にある。タグは動かさない（[git.md](./git.md)）。今回 workspace `version` だけ 0.12.0 に揃えた。npm 公開は後回し
- **v0.11.0 単体の package version** — 現行ツリーは v0.12 込みのため 0.11.0 では止めない。履歴として 0.11.0 の npm 相当は作っていない
- **Ruleset JSON** — `.github/rulesets/` は `main` にある。GitHub 上の実適用・required checks（CI `verify`）は 【PO作業】のまま
- **FV 画像** — kitchen-sink は `apps/kitchen-sink/src/assets/img/main-visual.png` を参照している（ドライジーネ）。差し替えは **時期未決・先送り**（現行アセットのまま運用する）
- **Tabs** — v0.8.0 で最小実装済み。roadmap v0.11.0 の「追加改修は対象外」は維持。改修版は未定

## 意図スタブ

### app kitchen-sink（→ v0.8.0 / v0.9.0・済）

- Vituum を維持し、Twig テンプレートにしたい（v0.8.0）
- その上でドキュメントサイトとして体裁を整えたい（v0.9.0）
- 別 SSG ジェネレータや CMS は後日検討（将来項目）

### ドキュメントサイト（→ v0.9.0・済）

- kitchen-sink を拡張する形
- FV: `apps/kitchen-sink/src/assets/img/main-visual.png`（差し替えは時期未決・先送り）

### yoshinani-form（→ v0.14.0）

- 別ソースをモノレポへ。取り込みは **git subtree**（ネスト `.git` は置かない）
- remote URL・入れ先パス・旧リポ archive は **【PO作業】**
- umbrella への深い統合は v0.14 必須外。SaaS スキャフォールドとバランスを見ながら後続で

### Web アプリ管理画面のスタートアップ雛形（→ v0.15.0 設計 / 実装は将来）

SaaS によくある画面を最初から用意したい。まずは設計のみ。

- 画面レイアウト
  - シンプル — ログイン画面等で使用
  - ダッシュボード — header, sidebar, main, footer 構成
  - 3column — main 領域がさらに 2 分割（メーラー等）
- 必要ページ
  - ログイン
  - パスワード再発行
  - ダッシュボード（サイドバー）
  - 設定画面（タブでサブ項目切替、Sortable.js で項目入れ替え UI）
- Sortable.js は scaffold 側依存（コア WC に入れない）
- 不足コンポーネントは設計時に洗い出し、roadmap へ転記

### ページネーション

- よく使うやつがあるので、それ
- 版未定

### ファイルポンド

- DnDで、ファイルをアップロードできるやつ
- 最大個数を指定可能
- プレビュー表示
- フロントでの容量チェック
- フロントでの、MIME TYPEチェック
- 版未定

### 展開可能な小窓

- 利用規約などを小さく表示する、インラインスクロールウインドウのあれ（スタイルのみで実現可能）
- 下部にボタンがついていて、高さを拡張できるモードも欲しい
  - 高さをどこまで展開するか
    - 全部/既定値/ユーザー指定
    - 選べるようにしたい
- 版未定

余談:
それで言うと、アコーディオンも、高さ制限したい時ってあるよね…

### ステップナビ

重要項目入力フォームなど
- 版未定
