import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "TheWheels",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: [
        "@b4moss/the-wheels-components",
        "@b4moss/the-wheels-style",
      ],
    },
  },
  plugins: [
    dts({
      include: ["src"],
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
});
