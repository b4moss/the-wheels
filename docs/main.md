# The Wheels

合同会社 知的・自転車向けのデザインシステム（スタイル + Web Components）。

## 目的

- 「すぐ使える最小同梱」
  - 日本語向けの見た目と、毎回必要になる基本機能は最初から入れる
  - 使わない機能や装飾的な部品は入れない
  - 足りないものは後から足す
- スタイルと機能を分け、ネイティブ CSS と Web Components で Web 標準として使う
- **ゴール**: npm パッケージとして公開する（タイミングは PO。現行 workspace は **0.12.0**、未公開）

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
- `data-tw-*` は接頭辞変更しても固定。将来のカスタムイベント名は接頭辞に追従（`getEventName`）。当面イベントは出さない

## 技術スタック

- Vite / TypeScript（npm パッケージモード、`strict: true`）
- 配布: ESM 主 + CJS dual package
- Vitest
- Node.js 22+
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
├── package.json                 # workspaces root
├── docs/
├── packages/
│   ├── style/                   # @b4moss/the-wheels-style
│   ├── components/              # @b4moss/the-wheels-components
│   │   └── assets/              # 同梱 SVG（icons.md）
│   └── the-wheels/              # @b4moss/the-wheels（全部入り）
└── apps/
    ├── kitchen-sink/            # 動作確認 + ドキュメントサイト（Vituum / Twig）
    └── storybook/               # コンポーネントカタログ
```

### パッケージ関係

```text
@b4moss/the-wheels
  ├─ @b4moss/the-wheels-style
  └─ @b4moss/the-wheels-components   # style 非依存（Light DOM）
```

- 公開単位はこの3つ（form は v0.14.0 で subtree 予定。umbrella 必須バンドルとは切り分ける）
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

## まだ対象外（版は roadmap 参照）

- Card / ContentSection
- Toast（Snackbar レイヤの上。版未定）
- フォーム系の深い統合（`yoshinani-form` は v0.14.0 で subtree。公式バンドルは必須外）

ロードマップは [roadmap.md](./roadmap.md)、PO メモは [wishlist.md](./wishlist.md)。

## テスト方針

[テスト方針](./test.md) を参照。

## Git / GitHub

ブランチ・PR・タグ・CI/CD は [git.md](./git.md)。

## 関数・メソッドの分割方針

- 1つのことをうまくやる
- 1ロジック、1責務
- 関数にするか、クラス・メソッドにするかは文脈に応じて判断する

## 特記事項

- the-wheels コア（style / components / umbrella）ではフォームを扱わない
- フォームは別プロダクト `yoshinani-form`。roadmap **v0.14.0** で git subtree によりモノレポへ取り込む
  - 取り込み後も、umbrella への深い統合や SaaS スキャフォールドとの本結合は後続（将来項目）
- a11y 本検討: roadmap 上は **無期限延期**（将来項目）

----

以上
