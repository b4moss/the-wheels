# FilePond

- **状態**: 方針確定
- **マイルストーン**: `v0.14.0`

既存プロダクトへの載せ替えで常用するアップロード UI。直近案件の必須ではないが、欠けていると画面置換が止まるため、E2E 定着の直後に入れる。

コアはフォームを扱わない。本 WC も **送信 HTTP は持たない**（選択・検証・プレビュー・イベントまで。送信は利用側）。

npm の `filepond` は **使わない**。自前の Web Component とし、見た目・操作感だけ寄せる。

## 含むもの

- Web Component（Light DOM）。JS クラス名は実装時に固定（例: `TwFilePond`）
- ファイルの選択（クリックおよび DnD）
- 最大個数
- フロントでの容量チェック
- フロントでの MIME TYPE チェック
- プレビュー
  - **画像のみ** サムネイルを出す
  - それ以外はファイル名・サイズ
- カスタムイベントで選択結果を渡す（総則の例外。Combobox の `load-request` と同様）
  - イベント名は `getEventName` に乗せる。名称は実装時に固定（例: `add` / `remove` / `reject`）
- 開閉モーション用トークンを **本版で最小追加**し、本 WC の出入に使う
  - duration / easing / `prefers-reduced-motion`（独立版にはしない。`tokens` へ足す）
- style / kitchen-sink / Storybook / Vitest

## 含まないもの

- サーバーへのアップロード（XHR / fetch）
- フォルダ DnD
- 画像クロップ・編集
- PDF の1枚目プレビュー（**v1.0.0 より後**。[unscheduled](../unscheduled/future-intents.md)）
- npm `filepond` のラップ
- `yoshinani-form` との結合
- a11y 本検討

## 受け入れの目安

既存画面で使っている操作（選ぶ・制限する・画像プレビューする）が置き換えられること。FilePond 相当のフル機能セットは目標にしない。

----

以上
