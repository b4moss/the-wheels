import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Dropdown",
  component: "tw-dropdown",
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () =>
    fromHtml(`
      <tw-dropdown>
        <tw-button slot="trigger">メニューを開く</tw-button>
        <div slot="panel">
          <p style="margin:0.8rem 1.2rem;max-width:none">
            panel の中身は自由に置けます。
          </p>
        </div>
      </tw-dropdown>
    `),
};

export const Placement: Story = {
  render: () =>
    fromHtml(`
      <div style="display:flex;flex-wrap:wrap;gap:1.6rem;align-items:center">
        <tw-dropdown placement="bottom-start">
          <tw-button slot="trigger" variant="stroke">bottom-start</tw-button>
          <div slot="panel">
            <p style="margin:0.8rem 1.2rem;max-width:none">bottom-start</p>
          </div>
        </tw-dropdown>
        <tw-dropdown placement="top-end">
          <tw-button slot="trigger" variant="stroke">top-end</tw-button>
          <div slot="panel">
            <p style="margin:0.8rem 1.2rem;max-width:none">top-end</p>
          </div>
        </tw-dropdown>
      </div>
    `),
};
