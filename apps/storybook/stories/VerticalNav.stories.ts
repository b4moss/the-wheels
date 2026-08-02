import type { Meta, StoryObj } from "@storybook/web-components";
import menuUrl from "@b4moss/the-wheels-components/assets/menu.svg?url";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Vertical Nav",
  component: "tw-vertical-nav",
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () =>
    fromHtml(`
      <div class="layout-sidebar" style="max-width:48rem">
        <aside class="sidebar">
          <nav aria-label="demo">
            <ul style="list-style:none;margin:0;padding:0;max-width:none">
              <li style="max-width:none;margin:0">
                <tw-vertical-nav>
                  <a href="#home" aria-current="page">
                    <tw-svg-loader
                      src="${menuUrl}"
                      width="18"
                      height="18"
                    ></tw-svg-loader>
                    Home
                  </a>
                </tw-vertical-nav>
              </li>
              <li style="max-width:none;margin:0">
                <tw-vertical-nav>
                  <a href="#docs">Documents</a>
                </tw-vertical-nav>
              </li>
              <li style="max-width:none;margin:0">
                <tw-vertical-nav>
                  <a href="#settings">Settings</a>
                </tw-vertical-nav>
              </li>
            </ul>
          </nav>
        </aside>
        <section>
          <h2>メイン</h2>
          <p>リストは素の HTML、項目だけが <code>tw-vertical-nav</code> です。</p>
        </section>
      </div>
    `),
};
