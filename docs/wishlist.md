# ウィッシュリスト

PO のメモ書き。決定事項は各ドキュメント（特に [roadmap.md](./roadmap.md)）に転記する。

- **UserMenu / CookieConsent** → roadmap **v0.12.0**
- **Playwright E2E** → roadmap **v0.13.0**
- **Toast / Pagination** → roadmap **v0.14.0**
- **ExpandablePane** → roadmap **v0.15.0**
- **FilePond** → roadmap **v0.16.0**
- **yoshinani-form subtree** → roadmap **v0.17.0**
- **StepNav** → roadmap **v0.18.0**（SaaS 設計より前）
- **SaaS スキャフォールド設計** → roadmap **v0.19.0**（実装は将来項目）
- **安定化** → roadmap **v0.20.0**（本当に最後の最後。急がない）
- 未決定の意図だけ本ファイルに残す。版が決まったら roadmap へ

## 優先順位（確定）

1. Twig → **v0.8.0**（済）
2. ドキュメントサイト体裁 → **v0.9.0**（済）
3. CI 整備 → **v0.10.0**（済）
4. 追加コンポーネント（Combobox / InfiniteScroll）→ **v0.11.0**
5. UserMenu / CookieConsent → **v0.12.0**
6. Playwright E2E（Floating UI 手厚め）→ **v0.13.0**（Storybook play は後続）
7. Toast + Pagination → **v0.14.0**
8. ExpandablePane → **v0.15.0**
9. FilePond → **v0.16.0**
10. yoshinani-form subtree → **v0.17.0**
11. StepNav → **v0.18.0**
12. SaaS スキャフォールド設計 → **v0.19.0**（実装は将来項目）
13. 安定化・品質 → **v0.20.0**（最後）
14. a11y 本検討 → **無期限延期**（将来項目）

詳細な含むもの／含まないものは roadmap を正とする。

## 意図スタブ

### app kitchen-sink（→ v0.8.0 / v0.9.0）

- Vituum を維持し、Twig テンプレートにしたい（v0.8.0）
- その上でドキュメントサイトとして体裁を整えたい（v0.9.0）
- 別 SSG ジェネレータや CMS は後日検討（将来項目）

### ドキュメントサイト（→ v0.9.0）

- kitchen-sink を拡張する形
- FV 参照アセット（旧 the-wheels）: `the-wheels/dev/src/assets/img/home/main-visual.png`（自転車っぽい乗った人の絵）。取り込み方針は PO 判断（コピー or プレースホルダ）

### Toast / Pagination（→ v0.14.0）

- Toast は Snackbar レイヤ（v0.12.0）の上に載せる
- Pagination はよく使うページ番号 UI（InfiniteScroll とは別）。参照があれば `docs/references/` へ

### ExpandablePane（→ v0.15.0）

- 利用規約などを小さく表示する、インラインスクロールウインドウ
- 下部ボタンで高さを拡張できるモード
  - 全部 / 既定値 / ユーザー指定を選べるようにしたい
- 余談: Accordion の高さ制限は別件（将来 / enhance）

### FilePond（→ v0.16.0）

- DnD でファイルアップロード UI
- 最大個数指定
- プレビュー表示
- フロントでの容量チェック・MIME TYPE チェック
- サーバーアップロード本体は WC 外

### yoshinani-form（→ v0.17.0）

- 別ソースをモノレポへ。取り込みは **git subtree**（ネスト `.git` は置かない）
- remote URL・入れ先パス・旧リポ archive は **【PO作業】**
- umbrella への深い統合は v0.17 必須外。SaaS スキャフォールドとバランスを見ながら後続で

### StepNav（→ v0.18.0）

- 重要項目入力フォームなど向け
- the-wheels 置きか form 置きかは版着手時に確定（SaaS 設計より前）

### Web アプリ管理画面のスタートアップ雛形（→ v0.19.0 設計 / 実装は将来）

SaaS によくある画面を最初から用意したい。まずは設計のみ。StepNav の後。

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
