import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Tabs",
  component: "tw-tabs",
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () =>
    fromHtml(`
      <tw-tabs>
        <button type="button" slot="tab">概要</button>
        <button type="button" slot="tab">詳細</button>
        <button type="button" slot="tab">履歴</button>
        <div slot="panel"><p style="margin:0">概要パネル</p></div>
        <div slot="panel"><p style="margin:0">詳細パネル</p></div>
        <div slot="panel"><p style="margin:0">履歴パネル</p></div>
      </tw-tabs>
    `),
};

export const SelectedIndex: Story = {
  name: "selected-index",
  render: () =>
    fromHtml(`
      <tw-tabs selected-index="1">
        <button type="button" slot="tab">JS</button>
        <button type="button" slot="tab">TS</button>
        <div slot="panel"><pre style="margin:0"><code>console.log("js");</code></pre></div>
        <div slot="panel"><pre style="margin:0"><code>console.log("ts");</code></pre></div>
      </tw-tabs>
    `),
};

export const SelectMethod: Story = {
  name: "select()",
  render: () => {
    const root = fromHtml(`
      <div>
        <tw-tabs id="story-tabs">
          <button type="button" slot="tab">One</button>
          <button type="button" slot="tab">Two</button>
          <div slot="panel"><p style="margin:0">Panel one</p></div>
          <div slot="panel"><p style="margin:0">Panel two</p></div>
        </tw-tabs>
        <p style="display:flex;gap:1.6rem;margin-top:1.6rem">
          <button type="button" id="to-one">select(0)</button>
          <button type="button" id="to-two">select(1)</button>
        </p>
      </div>
    `);
    const tabs = root.querySelector("#story-tabs") as HTMLElement & {
      select: (index: number) => void;
    };
    root.querySelector("#to-one")?.addEventListener("click", () => tabs?.select(0));
    root.querySelector("#to-two")?.addEventListener("click", () => tabs?.select(1));
    return root;
  },
};
