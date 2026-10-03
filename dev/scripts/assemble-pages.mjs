#!/usr/bin/env node
/**
 * Assemble kitchen-sink + Storybook into one static tree for GitHub Pages.
 * - `/`            → kitchen-sink `dist/`
 * - `/storybook/`  → Storybook `storybook-static/`
 * Custom domain CNAME: thewheels.oss.b4m.jp (base path `/`)
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CUSTOM_DOMAIN = "thewheels.oss.b4m.jp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "pages-site");
const kitchen = resolve(root, "apps/kitchen-sink/dist");
const storybook = resolve(root, "apps/storybook/storybook-static");

if (!existsSync(kitchen)) {
  console.error("Missing kitchen-sink dist. Run: npm run build:kitchen-sink");
  process.exit(1);
}
if (!existsSync(storybook)) {
  console.error("Missing storybook-static. Run: npm run build:storybook");
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(kitchen, out, { recursive: true });
mkdirSync(resolve(out, "storybook"), { recursive: true });
cpSync(storybook, resolve(out, "storybook"), { recursive: true });
writeFileSync(resolve(out, ".nojekyll"), "");
writeFileSync(resolve(out, "CNAME"), `${CUSTOM_DOMAIN}\n`);

console.log(`Assembled GitHub Pages site at ${out}`);
console.log("  /           → kitchen-sink");
console.log("  /storybook/ → Storybook");
console.log(`  CNAME       → ${CUSTOM_DOMAIN}`);
