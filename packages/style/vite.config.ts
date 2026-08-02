import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "TheWheelsStyle",
      formats: ["es"],
      fileName: "the-wheels-style",
    },
    rollupOptions: {
      output: {
        assetFileNames: "the-wheels-style[extname]",
      },
    },
    cssCodeSplit: false,
  },
});
