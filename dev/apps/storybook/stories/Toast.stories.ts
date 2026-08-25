import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Toast",
  component: "tw-toast",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => fromHtml(`
      <tw-toast variant="info" duration-ms="0">Hello</tw-toast>
    `),
};
