# Playwright E2E

- **状態**: 仕様詳細
- **マイルストーン**: `v0.13.0`
- テスト仕様: [tests/v0.13.0.md](../../tests/v0.13.0.md)
- テスト方針上書き: [test.md](../../test.md)
- CI 上書き: [git.md](../../git.md)

既存の `e2e/`・`playwright.config.ts` を、本仕様どおりに定着させる。a11y 本検討より優先。

着手は **`dev-v0.13.0` を取り込む**。現行の `e2e/` を土台に、本計画・テスト仕様との差分だけ直す。ゼロから書き直さない。

出荷済み WC の **JS の振る舞いは概ね足りている**。見た目・アニメーションは後続で詰める。E2E は色・px・アニメ完了を見ない（スタイル改修で壊れないようにする）。

## 含むもの

- Playwright（Chromium）: kitchen-sink 上の振る舞い E2E
  - 開閉系（Modal / ActionMenu / UserMenu 等）
  - Combobox / InfiniteScroll
  - CookieConsent
  - Floating UI を手厚く（端配置・複数 placement・viewport 内収まり）
- Floating UI 用フィクスチャページ（kitchen-sink）
- 実行対象サーバ
  - ローカル: kitchen-sink の `dev`
  - CI: kitchen-sink の `preview`（ビルド成果）
- CI のジョブ分離
  - `verify`: 現状どおり Vitest と主要 `build:*`
  - `e2e`: Playwright（Chromium）のみ。CI では `preview` を対象にする
  - 変更パスがすべて `docs/**` または `*.md`（ルートの `README.md` 含む）なら `e2e` をスキップする
  - required check は当面 `verify`。`e2e` は安定したら required に上げる（【PO作業】）

## 含まないもの

- kitchen-sink 全ページの HTTP 200 / ナビ横断 smoke
- Storybook play / interaction（後続。v0.19.0 で足してよい）
- 自動 VRT・Chromatic 必須化
- a11y 本検討
- Firefox / WebKit（本版は Chromium のみ）
- CSS のピクセル一致、Floating UI の座標厳密一致

## 未決（PO）

- `e2e` をいつ required にするか

----

以上
