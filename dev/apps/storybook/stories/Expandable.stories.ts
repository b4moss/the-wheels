import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Expandable",
  component: "tw-expandable",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => fromHtml(`
      <tw-expandable collapsed-height="4rem"><p>長いテキスト</p><p>続き</p></tw-expandable>
    `),
};
