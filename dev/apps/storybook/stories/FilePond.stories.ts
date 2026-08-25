import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/FilePond",
  component: "tw-file-pond",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => fromHtml(`
      <tw-file-pond max-files="3" accept="image/*"></tw-file-pond>
    `),
};
