# the-wheels ロードマップ

npm 公開タイミングはバージョンに固定せず、PO が見計らう。  
未実装の新機能計画の正本は [plans/](./plans/)（版フォルダ）。現状の作業索引として GitHub Issues / milestone も併用する。  
テスト仕様は `docs/tests/`（`specs/` と同じドメイン切り）。  
PO メモは [wishlist.md](./wishlist.md)。開発ルールは [charter/](./charter/README.md)。

## 現状

workspace `version` は **0.14.0**（`main` / `develop`）。npm は未公開。出荷済みの仕様は [README.md](./README.md)（pillar）と `docs/specs/`。

コア WC の初期一式は v0.12.0 までで揃い、v0.13.0 で Playwright E2E と CI の `verify` / `e2e` 分離を定着させ、v0.14.0 で FilePond / Expandable / StepNav / Pagination / Tabs 改修 / Toast を出荷した。以降は安定化とプレビュー基盤（GitHub Pages: [#63](https://github.com/b4moss/the-wheels/issues/63)）へ進む。

出荷済み WC の JS 振る舞いは概ね足りている。スタイル・アニメーションは甘い。全件監査は置かない。新規はトークンを使い、既存は触った画面だけ直す。

ルートの `Makefile` は `dev/package.json` の npm scripts をラップ済み（`make build-style` など）。

| 版 | 内容 | 状態 | 参照 |
| --- | --- | --- | --- |
| v0.13.0 | Playwright E2E | 完了 | [specs/e2e.md](./specs/e2e.md) / [tests/e2e.md](./tests/e2e.md) / [tests/components/](./tests/components/) |
| v0.14.0 | FilePond / 展開小窓・ステップナビ / ページネーション・Tabs 改修 / Toast | 完了 | [tests/v0.14.0.md](./tests/v0.14.0.md) / [#35](https://github.com/b4moss/the-wheels/issues/35) [#36](https://github.com/b4moss/the-wheels/issues/36) [#37](https://github.com/b4moss/the-wheels/issues/37) [#38](https://github.com/b4moss/the-wheels/issues/38) / [milestone](https://github.com/b4moss/the-wheels/milestone/2) |
| v0.15.0 | 安定化・品質（プレビューの GitHub Pages 寄せを含む） | 未着手 | [#40](https://github.com/b4moss/the-wheels/issues/40) [#63](https://github.com/b4moss/the-wheels/issues/63) / [milestone](https://github.com/b4moss/the-wheels/milestone/7) |
| v1.0.0 | 初回プロダクション想定 | 未着手 | [#41](https://github.com/b4moss/the-wheels/issues/41) / [milestone](https://github.com/b4moss/the-wheels/milestone/8) |

無期限延期・版未定: [unscheduled milestone](https://github.com/b4moss/the-wheels/milestone/9)（Card / ContentSection を含む）

## 依存（概略）

```text
v0.13.0 Playwright E2E（完了）
   └─ v0.14.0 FilePond / 展開小窓・ステップナビ / ページネーション・Tabs / Toast（完了）
         └─ v0.15.0 安定化（GitHub Pages プレビュー: #63）
               └─ v1.0.0
```

直列は版の優先順。v0.14.0 内の各項目同士の実装依存は薄かった（Toast は Snackbar レイヤ済み。ステップナビは段階表示のみで Tabs に依存しない）。

----

以上
