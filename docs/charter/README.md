# 憲章（charter）

このプロジェクトで守る開発ルール。[doc-rule.md](./doc-rule.md) 参照。  
改訂はあり得るが、**`_archived` へは移さない**（履歴は git または版注記）。

| 文書 | 内容 |
|------|------|
| [tdd.md](./tdd.md) | TDD 方針（氷山パターン、テスト仕様書） |
| [thin-ddd.md](./thin-ddd.md) | 薄い DDD（Controller / Service / Repository / Validation） |
| [git-rule.md](./git-rule.md) | git の運用 |
| [versioning-rule.md](./versioning-rule.md) | バージョンの運用 |
| [doc-rule.md](./doc-rule.md) | ドキュメント運用方針 |
| README.md | 本ドキュメント |

プロダクト要件の正本は [../main.md](../main.md)。

本リポ固有の上書き（矛盾する場合はこちらを優先）:

- [../git.md](../git.md) — ブランチ（`release` を npm 用にする。staging / production は置かない）、CI
- [../test.md](../test.md) — Vitest / Storybook / Playwright。テスト仕様は版ごと `docs/tests/vX.Y.Z.md`

## 適用範囲

### すべてのプロジェクト

- TDD
- Gitルール
- バージョニングルール
- ドキュメントルール

### Webアプリケーション / デスクトップアプリケーション

- 薄いDDD

### CLI、パッケージ、ブラウザ拡張

- 薄いDDDは意識しつつ、CRUDを伴わないものはCRUD Traitを採用しなくとも良い。

the-wheels はパッケージのため、薄い DDD（Controller / Repository / CRUD Trait）は **対応外**。意識するにとどめる。

### 例外

開発初期状態などは、憲章に沿わない状態を許容する。POが適宜判断。
バージョンを重ねるうちに整えていく。

## GitHub / Gitea 等の Issue や Project について

- 開発時は、LLMとの親和性を考え、`docs/`ベースの記述・開発で良い。
- 開発が進むと、複雑化するため、仕様は`docs/`に残しつつ、実装課題やTODOは、Issueを活用していく。
- ただし、Wikiは用いない。（仕様はコードリポジトリを正とするため）

----

以上
