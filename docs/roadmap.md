# the-wheels ロードマップ

npm 公開タイミングはバージョンに固定せず、PO が見計らう。  
将来実装の正本は **GitHub Milestone / Issue**（[Milestones](https://github.com/b4moss/the-wheels/milestones)）。  
テスト仕様は `docs/tests/vX.Y.Z.md`。  
PO メモは [wishlist.md](./wishlist.md)。開発ルールは [charter/](./charter/README.md)。

## 現状

workspace `version` は **0.12.0**。npm は未公開。出荷済みの仕様は [main.md](./main.md) と `docs/specs/`。

コア WC の初期一式は v0.12.0 までで揃っている。以降は E2E 定着のあと、載せ替えで常用する部品を足す。軽いものを先にする必要はない（FilePond を早めにするのは、既存プロダクトの画面置換で欠けるため）。

出荷済み WC の JS 振る舞いは概ね足りている。スタイル・アニメーションは甘い。全件監査は置かない。新規はトークンを使い、既存は触った画面だけ直す。

| 版 | 内容 | 状態 | Issue / Milestone |
| --- | --- | --- | --- |
| v0.13.0 | Playwright E2E | 次 | [#34](https://github.com/b4moss/the-wheels/issues/34) / [Milestone](https://github.com/b4moss/the-wheels/milestone/1) |
| v0.14.0 | FilePond | 未着手 | [#35](https://github.com/b4moss/the-wheels/issues/35) / [Milestone](https://github.com/b4moss/the-wheels/milestone/2) |
| v0.15.0 | 展開小窓 / ステップナビ | 未着手 | [#36](https://github.com/b4moss/the-wheels/issues/36) / [Milestone](https://github.com/b4moss/the-wheels/milestone/3) |
| v0.16.0 | ページネーション / Tabs 改修 | 未着手 | [#37](https://github.com/b4moss/the-wheels/issues/37) / [Milestone](https://github.com/b4moss/the-wheels/milestone/4) |
| v0.17.0 | Toast | 未着手 | [#38](https://github.com/b4moss/the-wheels/issues/38) / [Milestone](https://github.com/b4moss/the-wheels/milestone/5) |
| v0.18.0 | Card / ContentSection | 未着手 | [#39](https://github.com/b4moss/the-wheels/issues/39) / [Milestone](https://github.com/b4moss/the-wheels/milestone/6) |
| v0.19.0 | 安定化・品質 | 未着手 | [#40](https://github.com/b4moss/the-wheels/issues/40) / [Milestone](https://github.com/b4moss/the-wheels/milestone/7) |
| v1.0.0 | 初回プロダクション想定 | 未着手 | [#41](https://github.com/b4moss/the-wheels/issues/41) / [Milestone](https://github.com/b4moss/the-wheels/milestone/8) |

無期限延期・版未定: [Milestone unscheduled](https://github.com/b4moss/the-wheels/milestone/9)（#42–#50）。索引は [plans/README.md](./plans/README.md)。

## 依存（概略）

```text
v0.13.0 Playwright E2E
   └─ v0.14.0 FilePond
         └─ v0.15.0 展開小窓 / ステップナビ
               └─ v0.16.0 ページネーション / Tabs 改修
                     └─ v0.17.0 Toast
                           └─ v0.18.0 Card / ContentSection
                                 └─ v0.19.0 安定化
                                       └─ v1.0.0
```

直列は版の順序。コンポーネント同士の実装依存は薄い（Toast は Snackbar レイヤ済み。ステップナビは段階表示のみで Tabs に依存しない）。

----

以上
