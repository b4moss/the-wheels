# コンポーネント: Toast 仕様書

- Web Component（Light DOM）
- JS クラス名: `TwToast`
- タグ例: `tw-toast` / `data-tw-component="toast"`
- `createSnackbarLayer` 上の共有スタックに載せる

## 属性

- `variant`: `info` | `success` | `warning` | `error`
- `duration-ms`（既定 4000。`0` で自動消去なし）

## メソッド

- `show()` / `hide()`

## スタック

- 同一レイヤ内で複数可。新着を下。CookieConsent の単一バナー利用は壊さない

----

以上
