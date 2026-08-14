# 同梱 SVG アイコン方針

コンポーネント実装では [SVGLoader](./components/svg_loader.md) 経由で利用する。

## 置き場

- `packages/components/assets/`
- `@b4moss/the-wheels-components` に同梱して配布する

## 入手

1. npm 上の **MIT License** のアイコンセットから、必要なファイルだけ抽出する
2. 適当なものがなければ、PO が作成した SVG を配置する
3. 由来・ライセンスは `packages/components/assets/ATTRIBUTION.md` に残す

現行ソースは `@tabler/icons`（MIT、stroke アウトライン）。`@b4moss/the-wheels-components` の **devDependency**。配布物は `assets/` にコピーした SVG（利用側は Tabler を直接依存しなくてよい）。

- 再同期: `npm run sync:icons -w @b4moss/the-wheels-components`
- `spinner.svg` のみ、Tabler `loader-2` をベースに SVG 内 CSS 回転アニメーションを付与して別管理

## 同梱するアイコン（これ以外は同梱しない）

それ以外が必要な場合は、利用側（実装者）が用意する。

| 用途 | ファイル名 | 由来（Tabler outline） |
|---|---|---|
| スピナー | `spinner.svg` | `loader-2` + 回転アニメーション |
| 三本点（ActionMenu 等） | `more-vertical.svg` | `dots-vertical` |
| 閉じる（Modal 等） | `close.svg` | `x` |
| ハンバーガー | `menu.svg` | `menu-2` |
| チェック（アファーマティブ） | `check.svg` | `check` |
| シェブロン | `chevron.svg` | `chevron-down`（開閉は `rotate`） |
| ロック | `lock.svg` | `lock` |

## 描画の揃え方（目安）

- stroke ベースで統一する（SVGLoader の色・線幅制御を効かせやすくするため）
- viewBox `0 0 24 24`、`stroke="currentColor"`、`stroke-width="2"`（Tabler outline 準拠）
- PO 作成分も同じ規約に合わせる

## 将来

- 同梱セットの増減や、別パッケージ（例: アイコン専用パッケージ）での配信に切り替える可能性はある
- その場合も、公開パスを安定させ、SVGLoader のデフォルト `src` 参照だけ差し替えられる形を維持する

----

以上
