import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "TheWheelsComponents",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: ["@floating-ui/dom"],
    },
  },
  plugins: [
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.ts"],
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
});
