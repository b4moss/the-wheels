# 初回プロダクション想定

- **状態**: 意図スタブ
- **マイルストーン**: `v1.0.0`

## 含むもの（目安）

- style / components / the-wheels の公開面が安定
- README / 基本ドキュメントが利用可能な水準
- kitchen-sink がドキュメントサイトとして一通り使えること
- CI および Playwright E2E が PR で運用されていること。Storybook play は任意／後続
- 対応ブラウザ（最新2メジャー）での動作確認済み
- （PO 判断で）npm 公開

## この版で必須にしない

- SaaS スキャフォールドの**実装**（設計は v0.15.0）
- yoshinani-form の the-wheels 公式バンドル／深い統合（subtree 済みならリポ内にある状態で可）
- **a11y 本検討**（無期限延期）
- Card / ContentSection（必要になったら別バージョン。 [unscheduled](../unscheduled/future-intents.md)）
- [unscheduled](../unscheduled/future-intents.md) のうち未実施のもの

----

以上
