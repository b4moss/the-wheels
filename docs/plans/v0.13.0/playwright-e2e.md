# Playwright E2E

- **状態**: 仕様詳細
- **マイルストーン**: `v0.13.0`
- テスト仕様: [tests/v0.13.0.md](../../tests/v0.13.0.md)
- テスト方針上書き: [test.md](../../test.md)

自動テストの厚みを先に上げる。a11y 本検討より優先。

## 含むもの

- Playwright（Chromium）: kitchen-sink 上の振る舞い E2E
  - 開閉系（Modal / ActionMenu / UserMenu 等）
  - Combobox / InfiniteScroll
  - CookieConsent
  - Floating UI を手厚く（端配置・複数 placement・viewport 内収まり）
- Floating UI 用フィクスチャページ（kitchen-sink）
- CI への実行配線（PR で落ちたらマージ不可）

## 含まないもの

- kitchen-sink 全ページの HTTP 200 / ナビ横断 smoke
- Storybook play / interaction（後続版。v0.16.0 で足してよい）
- 自動 VRT・Chromatic 必須化
- a11y 本検討
- Firefox / WebKit（本版は Chromium のみ）

## 未決（PO）

- `dev-v0.13.0` ブランチに Playwright の着手コミットがある。`main` には未マージ。取り込むか、本計画・テスト仕様に沿ってやり直すか

----

以上
