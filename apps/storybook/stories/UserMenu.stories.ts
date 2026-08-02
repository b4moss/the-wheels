import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/UserMenu",
  component: "tw-user-menu",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
    fromHtml(`
      <tw-user-menu>
        <button type="button" slot="trigger" class="user-menu-trigger">
          <tw-avatar name="山田太郎" width="32" height="32"></tw-avatar>
          <span>山田太郎</span>
        </button>
        <a data-tw-user-menu-item href="#profile">プロフィール</a>
        <a data-tw-user-menu-item href="#settings">設定</a>
        <button type="button" data-tw-user-menu-item>ログアウト</button>
      </tw-user-menu>
    `),
};

export const PlacementTopEnd: Story = {
  render: () =>
    fromHtml(`
      <tw-user-menu placement="top-end">
        <button type="button" slot="trigger" class="user-menu-trigger">
          <tw-avatar name="佐藤花子" color="#494949" width="32" height="32"></tw-avatar>
          <span>佐藤花子</span>
        </button>
        <a data-tw-user-menu-item href="#account">アカウント</a>
        <a data-tw-user-menu-item href="#billing">請求</a>
      </tw-user-menu>
    `),
};
