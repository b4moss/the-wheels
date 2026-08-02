import type { Meta, StoryObj } from "@storybook/web-components";
import checkUrl from "@b4moss/the-wheels-components/assets/check.svg?url";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Button",
  component: "tw-button",
};

export default meta;
type Story = StoryObj;

export const Variants: Story = {
  render: () =>
    fromHtml(`
      <div style="display:flex;flex-wrap:wrap;gap:1.6rem;align-items:center">
        <tw-button>default</tw-button>
        <tw-button variant="stroke">stroke</tw-button>
        <tw-button variant="ghost">ghost</tw-button>
      </div>
    `),
};

export const WithIcon: Story = {
  render: () =>
    fromHtml(`
      <tw-button>
        <tw-svg-loader
          slot="icon-left"
          src="${checkUrl}"
          width="16"
          height="16"
          stroke-color="currentColor"
        ></tw-svg-loader>
        保存する
      </tw-button>
    `),
};

export const Disabled: Story = {
  render: () =>
    fromHtml(`
      <div style="display:flex;flex-wrap:wrap;gap:1.6rem;align-items:center">
        <tw-button disabled>disabled</tw-button>
        <tw-button variant="stroke" disabled>stroke disabled</tw-button>
        <tw-button variant="ghost" disabled>ghost disabled</tw-button>
      </div>
    `),
};

export const DisableOnClick: Story = {
  name: "disable-on-click",
  render: () => {
    const root = fromHtml(`
      <div style="display:flex;flex-wrap:wrap;gap:1.6rem;align-items:center">
        <tw-button id="click-once" disable-on-click>一度だけ押せる</tw-button>
        <button type="button" id="reset-btn">reset()</button>
      </div>
    `);
    const pending = root.querySelector("#click-once") as HTMLElement & {
      reset: () => void;
    };
    root.querySelector("#reset-btn")?.addEventListener("click", () => {
      pending?.reset();
    });
    return root;
  },
};
