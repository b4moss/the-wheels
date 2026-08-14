import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Accordion",
  component: "tw-accordion",
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () =>
    fromHtml(`
      <div>
        <tw-accordion>
          <span slot="header">セクション A</span>
          <div slot="content">
            <p>summary クリックまたは open/close で開閉します。</p>
          </div>
        </tw-accordion>
        <tw-accordion>
          <span slot="header">セクション B（同時オープン可）</span>
          <div slot="content">
            <p>複数パネルを同時に開けます（排他モードなし）。</p>
          </div>
        </tw-accordion>
      </div>
    `),
};

export const Group: Story = {
  render: () =>
    fromHtml(`
      <div>
        <p style="display:flex;gap:1.6rem;flex-wrap:wrap">
          <button type="button" data-tw-accordion-open="faq">FAQ をすべて開く</button>
          <button type="button" data-tw-accordion-close="faq">FAQ をすべて閉じる</button>
        </p>
        <tw-accordion data-tw-accordion-group="faq">
          <span slot="header">FAQ 1</span>
          <div slot="content"><p>グループ faq のパネルです。</p></div>
        </tw-accordion>
        <tw-accordion data-tw-accordion-group="faq">
          <span slot="header">FAQ 2</span>
          <div slot="content"><p>飛地でも同じ group 名で一斉開閉できます。</p></div>
        </tw-accordion>
      </div>
    `),
};
