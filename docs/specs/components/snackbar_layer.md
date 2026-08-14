# モジュール: Snackbar レイヤ（共有）仕様書

- CookieConsent および将来の Toast が共有する、画面端固定の表示レイヤ
- モジュール（`createSnackbarLayer`）。WC ではない。packages から再利用可能

## 目的

- 下部（将来は位置拡張しうる）にコンテンツを載せる共通の show / hide
- CookieConsent バナーと Toast で配置・出入ロジックを重複させない

## 振る舞い（最小）

- 表示／非表示を切り替えられる
- 既定の配置は **viewport 下部**
- 複数同時表示のスタック規則は Toast 導入時に詰める（現行は CookieConsent 単体利用。計画: [plans/v0.17.0](../../plans/v0.17.0/toast.md)）

## 含まないもの

- Toast の自動消去タイマー、バリアント、キューイングの本仕様
- a11y 本検討

----

以上
