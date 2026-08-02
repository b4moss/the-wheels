import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Avatar",
  component: "tw-avatar",
};

export default meta;
type Story = StoryObj;

export const Initials: Story = {
  render: () =>
    fromHtml(`
      <div style="display:flex;flex-wrap:wrap;gap:1.6rem;align-items:center">
        <tw-avatar name="山田太郎"></tw-avatar>
        <tw-avatar name="Alice" color="#3b3b3b"></tw-avatar>
        <tw-avatar name="日本" color="#000000" width="64" height="64"></tw-avatar>
      </div>
    `),
};

export const Image: Story = {
  render: () =>
    fromHtml(`
      <tw-avatar
        image-path="https://picsum.photos/seed/wheels/128"
        alt="Demo user"
        name="山"
        color="#3b3b3b"
        width="64"
        height="64"
      ></tw-avatar>
    `),
};
