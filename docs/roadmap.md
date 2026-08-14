# the-wheels ロードマップ

npm 公開タイミングはバージョンに固定せず、PO が見計らう。  
詳細計画は [plans/](./plans/README.md)。テスト仕様は `docs/tests/vX.Y.Z.md`。  
PO メモは [wishlist.md](./wishlist.md)。開発ルールは [charter/](./charter/README.md)。

## 現状

workspace `version` は **0.12.0**。npm は未公開。出荷済みの仕様は [main.md](./main.md) と `docs/specs/`。

| 版 | 内容 | 状態 | 計画 |
| --- | --- | --- | --- |
| v0.13.0 | Playwright E2E | 次 | [plans/v0.13.0](./plans/v0.13.0/playwright-e2e.md) |
| v0.14.0 | yoshinani-form subtree | 未着手 | [plans/v0.14.0](./plans/v0.14.0/yoshinani-form.md) |
| v0.15.0 | SaaS スキャフォールド設計 | 未着手 | [plans/v0.15.0](./plans/v0.15.0/saas-scaffold.md) |
| v0.16.0 | 安定化・品質 | 未着手 | [plans/v0.16.0](./plans/v0.16.0/stabilization.md) |
| v1.0.0 | 初回プロダクション想定 | 未着手 | [plans/v1.0.0](./plans/v1.0.0/production.md) |

未割当（Toast、a11y、別 SSG、npm CD、追加 WC 案など）: [plans/unscheduled](./plans/unscheduled/future-intents.md)

## 依存（概略）

```text
v0.13.0 Playwright E2E
   ├─ v0.14.0 form subtree
   └─ v0.15.0 SaaS 設計
         └─ v0.16.0 安定化
               └─ v1.0.0
                 └─（後続）SaaS 実装 / form 深い統合 / Toast / a11y（延期解除時）
```

`v0.14` と `v0.15` は直列必須ではない（推奨は 14 → 15）。

----

以上
