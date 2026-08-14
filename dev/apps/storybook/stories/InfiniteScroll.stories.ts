import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/InfiniteScroll",
  component: "tw-infinite-scroll",
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const root = fromHtml(`
      <div style="width:min(100%,20rem);border:1px solid #ccc;border-radius:8px;padding:0.4rem">
        <tw-infinite-scroll
          id="sb-is"
          sort-key="updated_at"
          sort-direction="desc"
          max-items="15"
        ></tw-infinite-scroll>
      </div>
    `);
    queueMicrotask(() => {
      const el = root.querySelector("#sb-is") as HTMLElement & {
        autoLoad: boolean;
        loadItems: (ctx: {
          direction: string;
          page: number | string;
        }) => Promise<{
          items: { value: string; label: string; updated_at: number }[];
          hasMore: boolean;
          nextPage: number;
        }>;
        refresh: () => Promise<void>;
      };
      if (!el) return;
      el.autoLoad = false;
      el.loadItems = async ({ direction, page }) => {
        await new Promise((r) => setTimeout(r, 80));
        const pageNum = typeof page === "number" ? page : Number(page) || 1;
        const base = direction === "up" ? 200 + pageNum * 10 : 100 - pageNum * 10;
        return {
          items: Array.from({ length: 4 }, (_, i) => ({
            value: `${direction}-${pageNum}-${i}`,
            label: `Item ${base - i} (${direction})`,
            updated_at: base - i,
          })),
          hasMore: pageNum < 3,
          nextPage: pageNum + 1,
        };
      };
      void el.refresh();
    });
    return root;
  },
};
