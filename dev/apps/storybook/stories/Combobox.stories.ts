import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Combobox",
  component: "tw-combobox",
};

export default meta;
type Story = StoryObj;

export const Static: Story = {
  render: () => {
    const root = fromHtml(`
      <tw-combobox id="sb-static" placeholder="Search fruits…">
        <tw-button slot="trigger" variant="stroke">選択</tw-button>
      </tw-combobox>
    `);
    queueMicrotask(() => {
      const el = root.querySelector("#sb-static") as HTMLElement & {
        options: { value: number; label: string }[];
      };
      if (el) {
        el.options = [
          { value: 1, label: "Apple" },
          { value: 2, label: "Banana" },
          { value: 3, label: "Cherry" },
        ];
      }
    });
    return root;
  },
};

export const Async: Story = {
  render: () => {
    const root = fromHtml(`
      <tw-combobox id="sb-async" mode="async" debounce="200" placeholder="Type to search…" sort-key="updated_at">
        <tw-button slot="trigger" variant="stroke">非同期</tw-button>
      </tw-combobox>
    `);
    queueMicrotask(() => {
      const el = root.querySelector("#sb-async") as HTMLElement & {
        loadOptions: (ctx: {
          query: string;
          page: number | string;
        }) => Promise<{
          items: { value: string; label: string; updated_at: number }[];
          hasMore: boolean;
        }>;
      };
      if (!el) return;
      const all = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"].map(
        (label, i) => ({
          value: `v${i}`,
          label,
          updated_at: 100 - i,
        }),
      );
      el.loadOptions = async ({ query }) => {
        await new Promise((r) => setTimeout(r, 150));
        const q = query.toLowerCase();
        return {
          items: all.filter((o) => o.label.toLowerCase().includes(q)),
          hasMore: false,
        };
      };
    });
    return root;
  },
};

export const Multiple: Story = {
  render: () => {
    const root = fromHtml(`
      <tw-combobox id="sb-multi" multiple max-selected="2" placeholder="最大2件">
        <tw-button slot="trigger" variant="ghost">複数</tw-button>
        <div slot="footer"><small>max-selected=2</small></div>
      </tw-combobox>
    `);
    queueMicrotask(() => {
      const el = root.querySelector("#sb-multi") as HTMLElement & {
        options: { value: number; label: string }[];
      };
      if (el) {
        el.options = [
          { value: 1, label: "Red" },
          { value: 2, label: "Green" },
          { value: 3, label: "Blue" },
        ];
      }
    });
    return root;
  },
};
