import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/StepNav",
  component: "tw-step-nav",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => fromHtml(`
      <tw-step-nav><div status="done">入力</div><div status="current">確認</div><div status="not_yet">完了</div></tw-step-nav>
    `),
};
