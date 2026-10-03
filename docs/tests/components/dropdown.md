# TwDropdown テスト仕様

関連仕様: [specs/components/dropdown.md](../../specs/components/dropdown.md)  
共通前提: [tests/e2e.md](../e2e.md)

- 発動領域をクリックすると panel が展開される
- Floating UI の flip / shift により viewport 内に収まるよう配置する
- フィクスチャページに、中央・上端・下端・左端・右端のトリガーを置く

対象ページ: `/dropdown-placement/`（フィクスチャ欠落時は skip せず、ページ追加を必須とする）

## テスト：正常系

- 中央 / 上端付近 / 下端付近 / 左端付近 / 右端付近の各トリガーから Dropdown を開ける
- 開いた panel の矩形が viewport に対して大きくはみ出さない（各辺のはみ出し 8px 未満）
- 端付近では flip / shift 後も開閉・項目クリックが可能である

## テスト: 異常系

- 閉じたあと再オープンしても再び viewport 内に収まって見える
- 連続で異なる端のトリガーを開閉しても例外なし
- 不正な `placement` 属性のデモでも開閉でき、viewport 内に収まる（フォールバック）

## TwDropdown.placement

- `placement` 属性で初期配置を指定する（既定は `bottom-start`）
- 少なくとも `bottom-start` / `top-end` / `left-start` / `right-end` をフィクスチャに置く

対象ページ: `/dropdown-placement/`

### テスト：正常系

- 指定した各 `placement` で panel が開く
- 開いた panel が viewport に対して大きくはみ出さない
- 閉じて再オープンしても再び収まって見える

### テスト: 異常系

- 不正な `placement` でも開閉でき、viewport 内に収まる
- 連続で異なる `placement` のトリガーを開閉しても例外なし

----

以上
