# The Wheels

合同会社 知的・自転車向けのデザインシステム（スタイル + Web Components）。

## 目的

- 「すぐ使える最小同梱」
  - 日本語向けの見た目と、毎回必要になる基本機能は最初から入れる
  - 使わない機能や装飾的な部品は入れない
  - 足りないものは後から足す
- スタイルと機能を分け、ネイティブ CSS と Web Components で Web 標準として使う
- **ゴール**: npm パッケージとして公開する（タイミングは PO。現行 workspace は **0.13.0**、未公開）

## ネーミング

- **正式名称**: `The Wheels`
- **識別子**: `the-wheels` / `thewheels`（ハイフンが使えない場合）

## フィロソフィーと責務

- 日本語で読みやすい UI
- 目に優しい
- 認知としてわかりやすい
- 組み込みが簡便
- 必要最低限に、少しだけ使いやすい機能を足す

### スタイルの責務

- リセット CSS — `reset-css`
- フォント — Inter + Noto Sans JP（本体は同梱せず、stack のみ。利用側が用意）
- ルート文字サイズは 62.5% 方式
- 詳細は [スタイル仕様](./specs/style.md)

#### 長文

- 1行はおおよそ40文字以内
- CSS では `max-width: 40ch`

#### デザイントークン

- CSS 変数名は `--tw-` 接頭辞（例: `--tw-text-main`）
- ユースケースごとの変数。バリアントは下のユースケースから oklch などで変化させる
- 色パレット（`red-100` 等）は必要が出るまで作らない

### コンポーネントの責務

- UI としての振る舞いを Web Components で提供する（JS クラス名は `TwButton` 形式。総則は [specs/components/all.md](./specs/components/all.md)）
- props / slot を適切に使う
- Light DOM。Shadow DOM は使わない
- WC はスタイルを持たない（利用側が CSS を当てられるようにする）
- 接頭辞はデフォルト `tw-`。import で自動登録。変えるときは import 前に `setPrefix`
- `data-tw-*` は接頭辞変更しても固定。カスタムイベント名は接頭辞に追従（`getEventName`）。既定は出さない（例外は [all.md](./specs/components/all.md)）

## 技術スタック

- Vite / TypeScript（npm パッケージモード、`strict: true`）
- 配布: ESM 主 + CJS dual package
- Vitest
- Node.js 24+
- Native CSS（`@layer`: `reset` / `tokens` / `base` / `components`）
- Web Components（Light DOM）
- Floating UI（`@floating-ui/dom`）— Dropdown 等のポジショニング（flip / shift デフォルト有効）
- npm workspaces
- kitchen-sink: Vituum + Twig の MPA（動作確認 + ドキュメントサイト体裁）
- Storybook: コンポーネントカタログ。説明・導線は kitchen-sink
- 対応ブラウザ: Chrome / Firefox / Safari / Edge の最新2メジャー
- ライセンス: MIT

## ディレクトリ構成

```text
the-wheels-reconstruct/          # Git repo
├── docs/
├── user-docs/
└── dev/                         # npm workspaces root
    ├── package.json
    ├── e2e/                     # Playwright
    ├── packages/
    │   ├── style/               # @b4moss/the-wheels-style
    │   ├── components/          # @b4moss/the-wheels-components
    │   │   └── assets/          # 同梱 SVG（icons.md）
    │   └── the-wheels/          # @b4moss/the-wheels（全部入り）
    └── apps/
        ├── kitchen-sink/        # 動作確認 + ドキュメントサイト（Vituum / Twig）
        └── storybook/           # コンポーネントカタログ
```

### パッケージ関係

```text
@b4moss/the-wheels
  ├─ @b4moss/the-wheels-style
  └─ @b4moss/the-wheels-components   # style 非依存（Light DOM）
```

- 公開単位はこの3つ（`yoshinani-form` の取り込みは無期限見送り。umbrella 必須バンドルにもしない）
- `@b4moss/the-wheels-style` は全部入り + 部分 import（`/css/tokens` など）
- 部品ごとの個別パッケージ分割は、需要が出てから検討する

## 現行コンポーネント

仕様は `docs/specs/components/`。同梱アイコンは [icons.md](./specs/icons.md)。

- SVGLoader / Spinner / Button
- Dropdown / ActionMenu
- Accordion / Modal
- Avatar / Vertical Nav
- Tabs（最小）
- Combobox / InfiniteScroll
- UserMenu / CookieConsent
- Snackbar レイヤ（共有モジュール。WC ではない）

## これから / 対象外

出荷済み WC の **JS の振る舞いは概ね足りている**。スタイル・アニメーションは甘い。全件監査マイルストーンは置かない。新規はトークンを使い、既存は触った画面だけ直す。

- Playwright E2E（v0.13.0 出荷）→ [specs/e2e.md](./specs/e2e.md)
- これから足す WC（FilePond / 展開小窓 / ステップナビ（段階表示） / ページネーション / Tabs 改修 / Toast）→ [roadmap.md](./roadmap.md) / [plans/v0.14.0/](./plans/v0.14.0/)
- フォーム系の深い統合、SaaS スキャフォールド、Card / ContentSection、a11y 本検討など → [plans/unscheduled](./plans/unscheduled/future-intents.md)

## ドキュメントの読み方

- 目的・現行仕様: 本ファイル / `docs/specs/`
- これから: [roadmap.md](./roadmap.md)（ハブ）/ [plans/](./plans/README.md)
- 守るルール: [charter/](./charter/README.md)
- 本リポの git / テスト上書き: [git.md](./git.md) / [test.md](./test.md)
- PO メモ: [wishlist.md](./wishlist.md)

## 関数・メソッドの分割方針

- 1つのことをうまくやる
- 1ロジック、1責務
- 関数にするか、クラス・メソッドにするかは文脈に応じて判断する

## 特記事項

- the-wheels コア（style / components / umbrella）ではフォームを扱わない
- フォームは別プロダクト `yoshinani-form`。本リポへの subtree 取り込みは **無期限見送り**（[unscheduled](./plans/unscheduled/future-intents.md)）
- a11y 本検討: **無期限延期**（[unscheduled](./plans/unscheduled/future-intents.md)）

----

以上
