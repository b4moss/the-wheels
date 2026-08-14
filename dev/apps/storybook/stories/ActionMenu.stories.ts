import type { Meta, StoryObj } from "@storybook/web-components";
import checkUrl from "@b4moss/the-wheels-components/assets/check.svg?url";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/ActionMenu",
  component: "tw-action-menu",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
    fromHtml(`
      <tw-action-menu>
        <button type="button">編集</button>
        <button type="button">複製</button>
        <button type="button">削除</button>
      </tw-action-menu>
    `),
};

export const CustomSrc: Story = {
  render: () =>
    fromHtml(`
      <tw-action-menu src="${checkUrl}">
        <button type="button">完了にする</button>
        <button type="button">キャンセル</button>
      </tw-action-menu>
    `),
};

export const CustomTrigger: Story = {
  render: () =>
    fromHtml(`
      <tw-action-menu>
        <tw-button slot="trigger" variant="stroke">操作</tw-button>
        <button type="button">共有</button>
        <button type="button">エクスポート</button>
      </tw-action-menu>
    `),
};
