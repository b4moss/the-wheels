# モジュール: Snackbar レイヤ（共有）仕様書

- CookieConsent および将来の Toast が共有する、画面端固定の表示レイヤ
- モジュール（`createSnackbarLayer`）。WC ではない。`@b4moss/the-wheels-components`（および umbrella）から再利用可能
- 公開 API: `createSnackbarLayer` / `SNACKBAR_LAYER_ATTR` / 型 `SnackbarLayer`・`CreateSnackbarLayerOptions`

## 目的

- 下部（将来は位置拡張しうる）にコンテンツを載せる共通の show / hide
- CookieConsent バナーと Toast で配置・出入ロジックを重複させない

## 振る舞い（最小）

- `show()` / `hide()` / `isVisible()` / `destroy()`
- ホスト要素に `data-tw-snackbar-layer` とクラス `snackbar-layer` を付与する
- 既定の配置は **viewport 下部**（スタイル側）
- Toast は共有レイヤ内の `.toast-stack` に縦積み（新着を下）。CookieConsent は従来どおり個別レイヤインスタンスを使ってよい（[toast.md](./toast.md)）

## 含まないもの

- Toast の自動消去タイマー、バリアント、キューイングの本仕様
- a11y 本検討

----

以上
