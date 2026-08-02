# 同梱 SVG アイコン方針

コンポーネント実装では [SVGLoader](./components/svg_loader.md) 経由で利用する。

## 置き場

- `packages/components/assets/`
- `@b4moss/the-wheels-components` に同梱して配布する

## 入手

1. まず npm 上の **MIT License** のアイコンセットから、必要なファイルだけ抽出する
2. 適当なものがなければ、PO が作成した SVG を配置する
3. 由来・ライセンスは ATTRIBUTION（または同等の表記）に残す

## 同梱するアイコン（これ以外は同梱しない）

それ以外が必要な場合は、利用側（実装者）が用意する。

| 用途 | ファイル名（案） | 備考 |
|---|---|---|
| スピナー | `spinner.svg` | アニメーション込み（SVG アニメーション） |
| 三本点（ActionMenu 等） | `more-vertical.svg` | |
| 閉じる（Modal 等） | `close.svg` | |
| ハンバーガー | `menu.svg` | |
| チェック（アファーマティブ） | `check.svg` | |
| シェブロン | `chevron.svg` | **1つだけ**。開閉は SVGLoader の `rotate` で表現する |
| ロック | `lock.svg` | disabled Button の右上など、小さく表示する想定 |

## 描画の揃え方（目安）

- stroke ベースで統一する（SVGLoader の色・線幅制御を効かせやすくするため）
- viewBox / ストローク規約はセット内で揃える
- PO 作成分も同じ規約に合わせる

## 将来

- 同梱セットの増減や、別パッケージ（例: アイコン専用パッケージ）での配信に切り替える可能性はある
- その場合も、公開パスを安定させ、SVGLoader のデフォルト `src` 参照だけ差し替えられる形を維持する

----

以上
