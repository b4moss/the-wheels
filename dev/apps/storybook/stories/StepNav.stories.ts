import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/StepNav",
  component: "tw-step-nav",
};

export default meta;
type Story = StoryObj;

export const InProgress: Story = {
  name: "done / current / not_yet",
  render: () =>
    fromHtml(`
      <tw-step-nav>
        <div status="done">入力</div>
        <div status="current">確認</div>
        <div status="not_yet">完了</div>
      </tw-step-nav>
    `),
};

export const NotStarted: Story = {
  name: "all not_yet",
  render: () =>
    fromHtml(`
      <tw-step-nav>
        <div status="not_yet">カート</div>
        <div status="not_yet">お届け先</div>
        <div status="not_yet">支払い</div>
        <div status="not_yet">完了</div>
      </tw-step-nav>
    `),
};

export const AllDone: Story = {
  name: "all done",
  render: () =>
    fromHtml(`
      <tw-step-nav>
        <div status="done">入力</div>
        <div status="done">確認</div>
        <div status="done">完了</div>
      </tw-step-nav>
    `),
};

export const SetCurrent: Story = {
  name: "setCurrent(index)",
  render: () => {
    const root = fromHtml(`
      <div>
        <tw-step-nav id="story-step-nav">
          <div status="not_yet">入力</div>
          <div status="not_yet">確認</div>
          <div status="not_yet">完了</div>
        </tw-step-nav>
        <p style="display:flex;flex-wrap:wrap;gap:1.6rem;margin-top:1.6rem">
          <button type="button" id="to-0">setCurrent(0)</button>
          <button type="button" id="to-1">setCurrent(1)</button>
          <button type="button" id="to-2">setCurrent(2)</button>
        </p>
      </div>
    `);
    const nav = root.querySelector("#story-step-nav") as HTMLElement & {
      setCurrent: (index: number) => void;
    };
    root.querySelector("#to-0")?.addEventListener("click", () => nav?.setCurrent(0));
    root.querySelector("#to-1")?.addEventListener("click", () => nav?.setCurrent(1));
    root.querySelector("#to-2")?.addEventListener("click", () => nav?.setCurrent(2));
    return root;
  },
};
