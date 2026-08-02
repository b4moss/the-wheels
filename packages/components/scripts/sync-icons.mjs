import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const outDir = join(packageRoot, "assets");

const tablerRootCandidates = [
  join(packageRoot, "node_modules", "@tabler", "icons"),
  join(packageRoot, "..", "..", "node_modules", "@tabler", "icons"),
];

const tablerRoot = tablerRootCandidates.find((candidate) =>
  existsSync(join(candidate, "icons", "outline")),
);

if (!tablerRoot) {
  throw new Error(
    "Could not find @tabler/icons. Run npm install from the monorepo root.",
  );
}

const outlineDir = join(tablerRoot, "icons", "outline");

/** @type {Record<string, string>} */
const mapping = {
  "more-vertical.svg": "dots-vertical.svg",
  "close.svg": "x.svg",
  "menu.svg": "menu-2.svg",
  "check.svg": "check.svg",
  "chevron.svg": "chevron-down.svg",
  "lock.svg": "lock.svg",
};

mkdirSync(outDir, { recursive: true });

for (const [destName, sourceName] of Object.entries(mapping)) {
  const from = join(outlineDir, sourceName);
  const to = join(outDir, destName);
  copyFileSync(from, to);
  console.log(`copied ${sourceName} -> ${destName}`);
}

console.log(
  "note: spinner.svg is maintained separately (Tabler loader-2 + CSS rotation).",
);
