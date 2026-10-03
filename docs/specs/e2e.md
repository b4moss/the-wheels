# Playwright E2E（現行）

kitchen-sink 上の振る舞い E2E。実装は `dev/e2e/`・`dev/playwright.config.ts`。テストケースの詳細は [tests/v0.13.0.md](../tests/v0.13.0.md)。CI のジョブ分離は [git.md](../git.md)。方針上書きは [test.md](../test.md)。

## 範囲

- Playwright（**Chromium のみ**）
- 開閉系: Modal / ActionMenu / Accordion
- Combobox（static / async / hybrid）/ InfiniteScroll
- CookieConsent
- Floating UI: Dropdown / ActionMenu の端配置・複数 `placement`・viewport 内収まり（フィクスチャ: `/dropdown-placement/`）
- アサートは振る舞いのみ（表示／非表示、開閉、件数、storage）。色・px・アニメ完了は見ない
- Floating UI の座標厳密一致はしない。panel 矩形が viewport に対して大きくはみ出さないこと（各辺のはみ出し 8px 未満）

## 実行対象サーバ

- ローカル（`npm run test:e2e` / `make test-e2e`）: kitchen-sink の **`dev`**（`127.0.0.1:5173`）
- CI: kitchen-sink の **`preview`**（同ホスト・ポート）

## CI

- `verify` と `e2e` を並列（成果物共有なし）
- 変更パスがすべて `docs/**` または `*.md`（ルート `README.md` 含む）なら `e2e` をスキップ
- required check は当面 `verify`。`e2e` を required にするかは 【PO作業】（[wishlist.md](../wishlist.md)）

## 含まないもの

- kitchen-sink 全ページの HTTP 200 / ナビ横断 smoke
- UserMenu 専用ケース（ActionMenu で充足）
- Storybook play / interaction（後続。計画: [#40 安定化・品質](https://github.com/b4moss/the-wheels/issues/40)）
- 自動 VRT・Chromatic
- Firefox / WebKit
- a11y 本検討

----

以上
