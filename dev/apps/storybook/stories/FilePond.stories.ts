import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/FilePond",
  component: "tw-file-pond",
};

export default meta;
type Story = StoryObj;

export const Images: Story = {
  name: "accept=image/*",
  render: () =>
    fromHtml(`
      <tw-file-pond max-files="3" max-size="1048576" accept="image/*"></tw-file-pond>
    `),
};

export const NonImage: Story = {
  name: "accept=application/pdf",
  render: () =>
    fromHtml(`
      <div>
        <tw-file-pond max-files="2" accept="application/pdf"></tw-file-pond>
        <p style="margin:1.6rem 0 0;opacity:.7;font-size:1.4rem">
          非画像はサムネイルではなくファイル名とサイズを表示します。
        </p>
      </div>
    `),
};

export const RejectReasons: Story = {
  name: "reject (max-files / max-size / accept)",
  render: () => {
    const root = fromHtml(`
      <div>
        <tw-file-pond
          id="story-pond-reject"
          max-files="1"
          max-size="1024"
          accept="image/png"
        ></tw-file-pond>
        <pre id="story-pond-log" style="margin-top:1.6rem;white-space:pre-wrap;font-size:1.2rem"><code>（イベントログ）</code></pre>
      </div>
    `);
    const pond = root.querySelector("#story-pond-reject");
    const log = root.querySelector("#story-pond-log code");
    const append = (line: string) => {
      if (!log) return;
      const prev =
        log.textContent === "（イベントログ）" ? "" : `${log.textContent}\n`;
      log.textContent = `${prev}${line}`;
    };
    pond?.addEventListener("tw-add", ((event: CustomEvent<{ file: File }>) => {
      append(`add: ${event.detail.file.name}`);
    }) as EventListener);
    pond?.addEventListener("tw-remove", ((event: CustomEvent<{ file: File }>) => {
      append(`remove: ${event.detail.file.name}`);
    }) as EventListener);
    pond?.addEventListener("tw-reject", ((
      event: CustomEvent<{ file: File; reason: string }>
    ) => {
      append(`reject: ${event.detail.file.name} (${event.detail.reason})`);
    }) as EventListener);
    return root;
  },
};
