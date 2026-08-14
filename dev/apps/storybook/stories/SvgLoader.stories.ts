import type { Meta, StoryObj } from "@storybook/web-components";
import checkUrl from "@b4moss/the-wheels-components/assets/check.svg?url";
import chevronUrl from "@b4moss/the-wheels-components/assets/chevron.svg?url";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/SVGLoader",
  component: "tw-svg-loader",
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () =>
    fromHtml(`
      <tw-svg-loader
        src="${checkUrl}"
        width="32"
        height="32"
        stroke-color="var(--tw-text-main)"
      ></tw-svg-loader>
    `),
};

export const FlipRotate: Story = {
  render: () =>
    fromHtml(`
      <div style="display:flex;gap:1.6rem;align-items:center">
        <tw-svg-loader
          src="${chevronUrl}"
          width="32"
          height="32"
          stroke-color="var(--tw-text-main)"
        ></tw-svg-loader>
        <tw-svg-loader
          src="${chevronUrl}"
          width="32"
          height="32"
          rotate="180"
          stroke-color="var(--tw-text-main)"
        ></tw-svg-loader>
      </div>
    `),
};
