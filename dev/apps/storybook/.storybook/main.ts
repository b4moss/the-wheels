import type { StorybookConfig } from "@storybook/web-components-vite";

/** Normalize to a trailing-slash public path for Vite/Storybook `base`. */
function normalizeBase(value: string | undefined): string {
  if (!value || value === "/") return "/";
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/**
 * Storybook is served under `/storybook/` on the Pages site
 * (https://thewheels.oss.b4m.jp/storybook/). Prefer PAGES_BASE_STORYBOOK;
 * otherwise derive from PAGES_BASE (site root, default `/`).
 */
function storybookBase(): string {
  if (process.env.PAGES_BASE_STORYBOOK) {
    return normalizeBase(process.env.PAGES_BASE_STORYBOOK);
  }
  const siteBase = normalizeBase(process.env.PAGES_BASE);
  if (siteBase === "/") return "/storybook/";
  return `${siteBase}storybook/`;
}

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|ts)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  async viteFinal(config) {
    // Only pin base for Pages builds. Local `storybook build` keeps Vite defaults.
    if (process.env.PAGES_BASE || process.env.PAGES_BASE_STORYBOOK) {
      config.base = storybookBase();
    }
    return config;
  },
};

export default config;
