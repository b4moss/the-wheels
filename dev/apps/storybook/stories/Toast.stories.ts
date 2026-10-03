import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Toast",
  component: "tw-toast",
};

export default meta;
type Story = StoryObj;

type ToastEl = HTMLElement & { show: () => void; hide: () => void };

export const Variants: Story = {
  name: "variants",
  render: () => {
    const root = fromHtml(`
      <div>
        <tw-toast id="t-info" variant="info" duration-ms="3000">お知らせです</tw-toast>
        <tw-toast id="t-success" variant="success" duration-ms="3000">保存しました</tw-toast>
        <tw-toast id="t-warning" variant="warning" duration-ms="3000">確認してください</tw-toast>
        <tw-toast id="t-error" variant="error" duration-ms="3000">エラーが発生しました</tw-toast>
        <p style="display:flex;flex-wrap:wrap;gap:1.6rem;margin:0">
          <button type="button" data-show="t-info">info</button>
          <button type="button" data-show="t-success">success</button>
          <button type="button" data-show="t-warning">warning</button>
          <button type="button" data-show="t-error">error</button>
        </p>
      </div>
    `);
    root.querySelectorAll<HTMLButtonElement>("[data-show]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-show");
        if (!id) return;
        (root.querySelector(`#${id}`) as ToastEl | null)?.show();
      });
    });
    return root;
  },
};

export const Sticky: Story = {
  name: "duration-ms=0",
  render: () => {
    const root = fromHtml(`
      <div>
        <tw-toast id="t-sticky" variant="info" duration-ms="0">手動で閉じるまで表示されます</tw-toast>
        <p style="display:flex;flex-wrap:wrap;gap:1.6rem;margin:0">
          <button type="button" id="show-sticky">show()</button>
          <button type="button" id="hide-sticky">hide()</button>
        </p>
      </div>
    `);
    const toast = root.querySelector("#t-sticky") as ToastEl | null;
    root.querySelector("#show-sticky")?.addEventListener("click", () => toast?.show());
    root.querySelector("#hide-sticky")?.addEventListener("click", () => toast?.hide());
    return root;
  },
};

export const Stacked: Story = {
  name: "stacked",
  render: () => {
    const root = fromHtml(`
      <div>
        <tw-toast id="t-a" variant="success" duration-ms="5000">1 件目の通知</tw-toast>
        <tw-toast id="t-b" variant="info" duration-ms="5000">2 件目の通知</tw-toast>
        <tw-toast id="t-c" variant="warning" duration-ms="5000">3 件目の通知</tw-toast>
        <p style="margin:0">
          <button type="button" id="show-stack">まとめて表示</button>
        </p>
      </div>
    `);
    root.querySelector("#show-stack")?.addEventListener("click", () => {
      (root.querySelector("#t-a") as ToastEl | null)?.show();
      (root.querySelector("#t-b") as ToastEl | null)?.show();
      (root.querySelector("#t-c") as ToastEl | null)?.show();
    });
    return root;
  },
};
