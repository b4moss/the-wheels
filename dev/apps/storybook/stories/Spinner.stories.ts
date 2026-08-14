import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Spinner",
  component: "tw-spinner",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
    fromHtml(`
      <p style="font-size:2.4rem;margin:0">
        読み込み中
        <tw-spinner stroke-color="var(--tw-text-main)"></tw-spinner>
      </p>
    `),
};

export const Sizes: Story = {
  render: () =>
    fromHtml(`
      <div style="display:flex;gap:1.6rem;align-items:center">
        <tw-spinner width="16" height="16" stroke-color="var(--tw-text-main)"></tw-spinner>
        <tw-spinner width="32" height="32" stroke-color="var(--tw-text-main)"></tw-spinner>
        <tw-spinner width="48" height="48" stroke-color="var(--tw-alert)"></tw-spinner>
      </div>
    `),
};
