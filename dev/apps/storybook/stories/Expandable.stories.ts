import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/Expandable",
  component: "tw-expandable",
};

export default meta;
type Story = StoryObj;

const sampleBody = `
  <p>長い利用規約テキストのサンプルです。折りたたみ時は領域内スクロール、展開で全体を表示します。</p>
  <p>追加の段落。追加の段落。追加の段落。追加の段落。追加の段落。</p>
  <p>さらに追加の段落。さらに追加の段落。さらに追加の段落。</p>
`;

export const Collapsed: Story = {
  name: "collapsed",
  render: () =>
    fromHtml(`
      <tw-expandable collapsed-height="6rem">${sampleBody}</tw-expandable>
    `),
};

export const Expanded: Story = {
  name: "open",
  render: () =>
    fromHtml(`
      <tw-expandable open collapsed-height="4rem">${sampleBody}</tw-expandable>
    `),
};

export const CustomHeightAndLabels: Story = {
  name: "heights / labels",
  render: () =>
    fromHtml(`
      <tw-expandable
        collapsed-height="3rem"
        expanded-height="10rem"
        expand-label="続きを読む"
        collapse-label="折りたたむ"
      >
        <p>collapsed-height / expanded-height とカスタムラベルの例です。</p>
        <p>展開時も max-height でクリップされ、はみ出しはスクロールできます。</p>
        <p>段落を重ねて高さを確保しています。段落を重ねて高さを確保しています。</p>
        <p>段落を重ねて高さを確保しています。段落を重ねて高さを確保しています。</p>
        <p>段落を重ねて高さを確保しています。段落を重ねて高さを確保しています。</p>
      </tw-expandable>
    `),
};
