import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vituum from "vituum";
import twig from "@vituum/vite-plugin-twig";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const srcDir = resolve(rootDir, "src");

export default defineConfig({
  plugins: [
    vituum(),
    twig({
      root: srcDir,
      namespaces: {
        layouts: resolve(srcDir, "layouts"),
        partials: resolve(srcDir, "partials"),
      },
    }),
  ],
});
