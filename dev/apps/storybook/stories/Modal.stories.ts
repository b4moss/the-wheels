import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Modal",
  component: "tw-modal",
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const root = fromHtml(`
      <div>
        <tw-button type="button" id="open-modal">モーダルを開く</tw-button>
        <tw-modal id="demo-modal">
          <h2 slot="header">確認</h2>
          <div slot="content">
            <p>× ボタン、backdrop、フッターの閉じる、Escape で閉じられます。</p>
          </div>
          <div slot="footer">
            <tw-button type="button" variant="ghost" data-tw-modal-close>キャンセル</tw-button>
            <tw-button type="button" data-tw-modal-close>OK</tw-button>
          </div>
        </tw-modal>
      </div>
    `);
    const modal = root.querySelector("#demo-modal") as HTMLElement & {
      showModal: () => void;
    };
    root.querySelector("#open-modal")?.addEventListener("click", () => {
      modal?.showModal();
    });
    return root;
  },
};
