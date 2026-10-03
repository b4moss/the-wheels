import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vituum from "vituum";
import twig from "@vituum/vite-plugin-twig";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const srcDir = resolve(rootDir, "src");

/** Normalize to a trailing-slash public path (Vite `base` / Twig `site_base`). */
function normalizeBase(value) {
  if (!value || value === "/") return "/";
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

const siteBase = normalizeBase(process.env.PAGES_BASE);

export default defineConfig({
  base: siteBase,
  plugins: [
    vituum(),
    twig({
      root: srcDir,
      globals: {
        site_base: siteBase,
      },
      namespaces: {
        layouts: resolve(srcDir, "layouts"),
        partials: resolve(srcDir, "partials"),
      },
    }),
  ],
});
