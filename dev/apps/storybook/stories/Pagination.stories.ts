import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Pagination",
  component: "tw-pagination",
};

export default meta;
type Story = StoryObj;

function withPageLabel(html: string, initialPage: number): HTMLElement {
  const root = fromHtml(`
    <div>
      ${html}
      <p id="page-label" style="margin:1.6rem 0 0;opacity:.7;font-size:1.4rem">page: ${initialPage}</p>
    </div>
  `);
  const pager = root.querySelector("tw-pagination");
  const label = root.querySelector("#page-label");
  pager?.addEventListener("tw-change", ((event: CustomEvent<{ page: number }>) => {
    if (label) label.textContent = `page: ${event.detail.page}`;
  }) as EventListener);
  return root;
}

export const FirstPage: Story = {
  name: "first page",
  render: () =>
    withPageLabel(`<tw-pagination page="1" total-pages="7"></tw-pagination>`, 1),
};

export const MiddlePage: Story = {
  name: "middle page",
  render: () =>
    withPageLabel(`<tw-pagination page="4" total-pages="7"></tw-pagination>`, 4),
};

export const LastPage: Story = {
  name: "last page",
  render: () =>
    withPageLabel(`<tw-pagination page="7" total-pages="7"></tw-pagination>`, 7),
};
