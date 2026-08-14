import type { Preview } from "@storybook/web-components";
import "@b4moss/the-wheels/style";
import "@b4moss/the-wheels";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
  },
};

export default preview;
