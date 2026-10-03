# components テスト仕様

Playwright E2E でカバーしているコンポーネントのテスト仕様。  
`docs/specs/components/` と同じドメイン切り。共通前提は [../e2e.md](../e2e.md)。

| コンポーネント | テスト仕様 | 仕様正本 |
| --- | --- | --- |
| Modal | [modal.md](./modal.md) | [specs](../../specs/components/modal.md) |
| ActionMenu | [action_menu.md](./action_menu.md) | [specs](../../specs/components/action_menu.md) |
| Accordion | [accordion.md](./accordion.md) | [specs](../../specs/components/accordion.md) |
| Dropdown | [dropdown.md](./dropdown.md) | [specs](../../specs/components/dropdown.md) |
| Combobox | [combobox.md](./combobox.md) | [specs](../../specs/components/combobox.md) |
| InfiniteScroll | [infinite_scroll.md](./infinite_scroll.md) | [specs](../../specs/components/infinite_scroll.md) |
| CookieConsent | [cookie_consent.md](./cookie_consent.md) | [specs](../../specs/components/cookie_consent.md) |

Vitest でカバー済みの単体分岐はここへ重複させない。E2E 未カバーの WC は specs のみ。

----

以上
