import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Pagination",
  component: "tw-pagination",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => fromHtml(`
      <tw-pagination page="2" total-pages="5"></tw-pagination>
    `),
};
