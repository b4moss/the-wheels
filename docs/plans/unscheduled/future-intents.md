# 未割当・延期

- **状態**: 意図スタブ
- **マイルストーン**: `unscheduled` または無期限延期

版が決まったら `plans/vX.Y.Z/` へ移し、[roadmap.md](../../roadmap.md) の表に載せる。

## 無期限延期

- **a11y 本検討** — キーボード／フォーカス／ARIA の方針決定と実装、仕様書への本反映。再開時期は未定
- **yoshinani-form subtree** — 都合により本リポへの取り込みは見送る。コアはフォームを扱わない方針は維持
- **form × scaffold の本統合** — form 取り込み前提のため、同様に見送り

## 版未定

- **SaaS スキャフォールド設計 / 実装** — WC 一式の後でよい。form なしでも設計は進められる
- **ドキュメント用 別 SSG / CMS**
- **release dry-run / npm CD の本実装** — 方針の上書きは [git.md](../../git.md)
- **FV 画像差し替え** — 現行は `apps/kitchen-sink/src/assets/img/main-visual.png`（ドライジーネ）。現行アセットのまま運用する
- **Accordion の高さ制限** — 要実装。v0.15.0 の展開小窓とは別。版が決まったら Accordion 仕様へ足す
- **FilePond の PDF 1枚目プレビュー** — 画像プレビューは v0.14.0。PDF は **v1.0.0 より後**

----

以上
