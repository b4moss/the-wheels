import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/package-smoke.test.ts"],
    // Package smoke imports built dist; keep workers single-threaded so
    // setPrefix / customElements state stays predictable.
    fileParallelism: false,
  },
});
