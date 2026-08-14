import type { Meta, StoryObj } from "@storybook/web-components";
import { fromHtml } from "./_html";

const meta: Meta = {
  title: "Components/CookieConsent",
  component: "tw-cookie-consent",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    try {
      localStorage.removeItem("sb-cookie-consent");
    } catch {
      // ignore
    }
    return fromHtml(`
      <tw-cookie-consent
        storage-key="sb-cookie-consent"
        service-ids="analytics,ads,personalization"
      >
        <p>当サイトは Cookie を利用します。続行する場合はすべて承諾してください。</p>
        <div class="cookie-consent-actions">
          <tw-button data-tw-cookie-accept-all>すべて承諾</tw-button>
          <a href="#settings" data-tw-cookie-settings>
            <tw-button variant="stroke">設定する</tw-button>
          </a>
        </div>
      </tw-cookie-consent>
    `);
  },
};
