# テスト仕様

`docs/specs/` と**同じドメイン切り**。SemVer フォルダ（`vX.Y.Z/`）は使わない。  
方針上書きは [test.md](../test.md)。歴史的な版ファイルは [_archived/tests/](../_archived/tests/)。

| ドメイン | パス | 対応 specs |
| --- | --- | --- |
| e2e | [e2e.md](./e2e.md) | [specs/e2e.md](../specs/e2e.md) |
| components | [components/](./components/) | [specs/components/](../specs/components/) |

出荷済みコンポーネントの振る舞い正本は `docs/specs/components/`。Vitest はコード側。

----

以上
