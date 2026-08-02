# the-wheels-reconstruct

このプロジェクトは、`the-wheels`というフロントエンドプロジェクトの再構築です。

## 目的

`the-wheels`は、以下の目的で開発されました。

- 合同会社 知的・自転車でよく使われるUI集（デザインシステム）として活用する。
- 「すぐ使える最小同梱」を目指す。
  - 日本語向けの見た目と、毎回必要になる基本機能は最初から入れる。
  - 既存 OSS UI 集にありがちな、使わない機能や装飾的な部品は入れない。
  - 全部入りではなく、必要十分。足りないものは後から足す。
- スタイルと機能を分け、ネイティブCSS、Web Componentsを採用し、Web標準で利用できるようにする。
- **ゴール**: npmパッケージとして公開する。


## 背景

- フロントエンドに関しては、「すぐ使える最小同梱」にしたかった。
- スタイル・WebComponentsで分けて開発し、時間がかかっていた。いまだに完成していない。
- 別々の開発を、モノリポ（workspaces）に統合したい。
- スタイルやコンポーネントは別々にnpmパッケージ化するが、上層で全部入りのパッケージも用意したい。

## やること

- 作りかけのソースコードから、必要なエッセンスを抽出する。
  - [the-wheels](../../the-wheels/)
  - [the-wheels-css](../../the-wheels-css/)
  - [the-wheels-webcomponents](../../the-wheels-webcomponents/)
  - これらのリポジトリは、必要がなくなれば破棄する。
- 当リポジトリを、正当な`the-wheels`として、将来リリースする。
  - その時は、リポジトリ名称も変更する。

## ネーミング

- **正式名称**: `The Wheels` - 自然言語として扱う場合の固有名詞
- **識別子**:
  - `the-wheels`
  - `thewheels` - ハイフンが使えない場合

## フィロソフィーと責務

- 日本語で読みやすいUIを提供すること
- 目に優しい
- 認知としてわかりやすい
- 組み込みが簡便であること
- しかし、必要最低限の機能と、少しだけ使いやすい機能を提供すること

### スタイルの責務

- リセットCSS - `reset-css`を採用
- フォント - Inter + Noto Sans JP（本体は同梱せず、stack のみ定義。利用側が用意）
- ルート文字サイズは 62.5% 方式
- 詳細は [スタイル仕様](./specs/style.md) を参照

#### 長文の扱い

- 1行はおおよそ40文字以内に収めること
- CSS では `max-width: 40ch` で抑える

#### デザイントークン

- 色や数値は、デザイントークンに抽象化する。
- CSS 変数名は `--tw-` 接頭辞を付ける（例: `--tw-text-main`）
- ユースケースごとの変数を作る。
  - ユースケースにバリアントを求めるときは、下のユースケースから、oklchなどで色を変化させる。
  - 色ごとのデザイントークンは必要が出るまで作らない（常識的な設計では、`red-100`などの定義は不要と考える）。

### コンポーネントの責務

- UIとしての振る舞いを提供する。
- Web Componentsで実装する（JS クラス名は `TwButton` 形式。総則は [specs/components/all.md](./specs/components/all.md)）。
- props, slotを適切に使用する。
- Light DOMで実装する。Shadow DOMは使わない。
- WCは、スタイルを持たない。（ユーザーが好きなCSSを当てられるようにするため）
- 接頭辞はデフォルト `tw-`。import で自動登録。変えるときは import 前に `setPrefix`。
- `data-tw-*` は接頭辞変更しても固定。将来のカスタムイベント名は接頭辞に追従（`getEventName`）。当面イベントは出さない。

## 技術スタック

- Vite/TypeScript - npmパッケージモード（`strict: true`）
- 配布形式: ESM 主 + CJS も dual package
- Vitest
- Node.js 22+
- Native CSS（`@layer`: `reset` / `tokens` / `base` / `components`）
- ルート文字サイズ: 62.5% 方式
- Web Components（Light DOM）
- Floating UI（`@floating-ui/dom`）— Dropdown 等のポジショニング（flip / shift デフォルト有効）
- npm workspaces
- kitchen-sink: Vituum による MPA（関心ごとの複数ページ）
- Storybook: コンポーネントがある程度揃ってから導入する
- 対応ブラウザ: Chrome / Firefox / Safari / Edge の最新2メジャー
- ライセンス: MIT
- npm 公開タイミングはバージョンに固定せず、PO が見計らう

## ディレクトリ構成案

```text
the-wheels-reconstruct/          # Git repo（将来 the-wheels にリネーム）
├── package.json                 # workspaces root
├── docs/
│   └── main.md
├── packages/
│   ├── style/                   # @b4moss/the-wheels-style
│   │   ├── package.json
│   │   └── src/
│   ├── components/              # @b4moss/the-wheels-components
│   │   ├── package.json         # style は同梱しない
│   │   ├── assets/              # 同梱 SVG（icons.md 参照。chevron は1種）
│   │   └── src/
│   │       ├── accordion/
│   │       ├── modal/
│   │       └── ...
│   └── the-wheels/              # @b4moss/the-wheels（全部入り）
│       ├── package.json         # deps: style + components
│       └── src/
└── apps/
    ├── kitchen-sink/            # 動作確認用（Vituum MPA）
    │   └── package.json
    └── storybook/               # コンポーネントが揃ってから実装
        └── package.json
```

### パッケージ関係

```text
@b4moss/the-wheels
  ├─ @b4moss/the-wheels-style
  └─ @b4moss/the-wheels-components   # style 非依存（Light DOM）
```

- 公開単位は最初からこの3つまでとする。
- `@b4moss/the-wheels-style` は全部入り + 部分 import（`/css/tokens` など）を提供する。
- 部品ごとの個別パッケージ分割は、需要が出てから検討する。
- kitchen-sink は抽出・実装の動作確認場とする。
- Storybook はドキュメント／カタログ用途とし、Components がある程度揃ってから入れる。
- v0.1.0 では npm に公開しない（リポジトリ内利用）。以降も公開タイミングは PO が見計らう。ロードマップは [roadmap.md](./roadmap.md) を参照。

### 参考リポジトリ（リポジトリ外・将来削除）

- [the-wheels](../../the-wheels/)
- [the-wheels-css](../../the-wheels-css/)
- [the-wheels-webcomponents](../../the-wheels-webcomponents/)

### 参考リポジトリから抽出する要素

#### スタイル（ほぼ再利用）

- Typography
- 色のルール（ユースケース起点のトークン）
- reset, focus, spacing, breakpoints
- コンポーネント用スタイル（下記コンポーネントに対応するもの）
- レイアウト最低限（container / sidebar など。Vertical Nav のデモに必要）

#### コンポーネント

##### 再利用

- Button（WC。仕様: `docs/specs/components/button.md`）
- Accordion（Shadow DOM → Light DOM に書き換え）
- Modal（同上。`<dialog>` 採用）
- SVGLoader（参照に明確な実装がなければ新規。Button / Nav の依存元になりやすい）

##### 新規

- Dropdown（Floating UI 採用）
- ActionMenu（Dropdown + SVGLoader。メニュー項目は slot 列挙）
- Avatar
- Vertical Nav（実体は Item。タグは `tw-vertical-nav`。リストは素の HTML）
- Spinner（SVGLoader 経由）

##### 今回対象外

- Card
- ContentSection
- CookieConsent
- フォーム系（`yoshinani-form` 側）

##### 実装順（目安）

詳細な版分けは [roadmap.md](./roadmap.md) を参照。

1. v0.1.0 スタイル土台（[specs/style.md](./specs/style.md)）
2. v0.2.0 SVGLoader → Spinner → Button
3. v0.3.0 Dropdown → ActionMenu
4. v0.4.0 Accordion / Modal
5. v0.5.0 Avatar / Vertical Nav
6. v0.6.0〜 全部入り実用化 → Storybook → a11y → 安定化 → v1.0.0

仕様の詳細は `docs/specs/components/`、`docs/specs/style.md`、同梱アイコンは `docs/specs/icons.md` を参照。

## テスト方針

[テスト方針](./test.md)を参照して下さい。

## 関数・メソッドの分割方針

- UNIX哲学にある **1つのことをうまくやる** を大切にする。
- 1ロジック、1責務と考える。
- 関数にするか、クラス・メソッドにするかは、文脈に応じて適切に判断する。

## 特記事項

- the-wheelsでは、フォームは扱わない
- フォームは別途`yoshinani-form`というプロダクトを開発している。
  - 状況次第で、これもモノリポにするかもしれない。

----

以上
