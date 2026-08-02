import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const REQUIRED_UMBRELLA_EXPORTS = [
  "setPrefix",
  "getPrefix",
  "getEventName",
  "defineComponent",
  "TwSvgLoader",
  "TwSpinner",
  "TwButton",
  "TwDropdown",
  "TwActionMenu",
  "TwAccordion",
  "TwModal",
  "TwAvatar",
  "TwVerticalNav",
  "TwTabs",
] as const;

const PACKAGE_DIRS: Record<string, string> = {
  "@b4moss/the-wheels-components": "packages/components",
  "@b4moss/the-wheels": "packages/the-wheels",
  "@b4moss/the-wheels-style": "packages/style",
};

function packageDir(name: string): string {
  const rel = PACKAGE_DIRS[name];
  if (!rel) throw new Error(`Unknown package: ${name}`);
  return join(root, rel);
}

function readPackageExports(packageName: string): Record<string, unknown> {
  const pkg = JSON.parse(
    readFileSync(join(packageDir(packageName), "package.json"), "utf8"),
  ) as { exports?: Record<string, unknown> };
  return pkg.exports ?? {};
}

function exportEntry(exportsMap: Record<string, unknown>, key: string) {
  return exportsMap[key];
}

function hasCondition(
  entry: unknown,
  condition: "types" | "import" | "require",
): boolean {
  if (!entry || typeof entry !== "object") return false;
  return condition in (entry as Record<string, unknown>);
}

afterEach(async () => {
  const { setPrefix } = await import("@b4moss/the-wheels");
  setPrefix("tw");
});

describe("package.json exports（静的）", () => {
  it("components exports[.] has types/import/require and assets", () => {
    const exportsMap = readPackageExports("@b4moss/the-wheels-components");
    const rootEntry = exportEntry(exportsMap, ".");
    expect(hasCondition(rootEntry, "types")).toBe(true);
    expect(hasCondition(rootEntry, "import")).toBe(true);
    expect(hasCondition(rootEntry, "require")).toBe(true);
    expect(exportEntry(exportsMap, "./assets/*")).toBeTruthy();

    const importPath = (rootEntry as { import: string }).import;
    expect(importPath.includes("/dist/")).toBe(true);
    expect(importPath.endsWith(".ts")).toBe(false);
  });

  it("umbrella exports[.] has types/import/require and ./style", () => {
    const exportsMap = readPackageExports("@b4moss/the-wheels");
    const rootEntry = exportEntry(exportsMap, ".");
    expect(hasCondition(rootEntry, "types")).toBe(true);
    expect(hasCondition(rootEntry, "import")).toBe(true);
    expect(hasCondition(rootEntry, "require")).toBe(true);
    expect(exportEntry(exportsMap, "./style")).toBeTruthy();

    const importPath = (rootEntry as { import: string }).import;
    expect(importPath.includes("/dist/")).toBe(true);
  });

  it("style exports[.] and ./css/*", () => {
    const exportsMap = readPackageExports("@b4moss/the-wheels-style");
    expect(exportEntry(exportsMap, ".")).toBeTruthy();
    expect(exportEntry(exportsMap, "./css/*")).toBeTruthy();
  });
});

describe("Build artifacts", () => {
  it("components dist has ESM, CJS, and d.ts", () => {
    const dir = packageDir("@b4moss/the-wheels-components");
    expect(existsSync(join(dir, "dist/index.js"))).toBe(true);
    expect(existsSync(join(dir, "dist/index.cjs"))).toBe(true);
    expect(existsSync(join(dir, "dist/index.d.ts"))).toBe(true);
  });

  it("umbrella dist has ESM, CJS, d.ts and style CSS", () => {
    const dir = packageDir("@b4moss/the-wheels");
    expect(existsSync(join(dir, "dist/index.js"))).toBe(true);
    expect(existsSync(join(dir, "dist/index.cjs"))).toBe(true);
    expect(existsSync(join(dir, "dist/index.d.ts"))).toBe(true);
    expect(existsSync(join(dir, "src/style.css"))).toBe(true);
  });
});

describe("ESM 解決（@b4moss/the-wheels）", () => {
  it("imports named exports and setPrefix works", async () => {
    const mod = await import("@b4moss/the-wheels");
    expect(typeof mod.setPrefix).toBe("function");
    expect(typeof mod.getPrefix).toBe("function");
    expect(typeof mod.TwButton).toBe("function");
    expect(typeof mod.TwAvatar).toBe("function");

    mod.setPrefix("app");
    expect(mod.getPrefix()).toBe("app-");
  });
});

describe("CJS 解決（@b4moss/the-wheels）", () => {
  it("require returns setPrefix / TwButton", () => {
    const mod = require("@b4moss/the-wheels") as Record<string, unknown>;
    expect(mod && typeof mod).toBe("object");
    expect(typeof mod.setPrefix).toBe("function");
    expect(typeof mod.TwButton).toBe("function");
  });
});

describe("components 単独解決", () => {
  it("ESM: setPrefix / TwSvgLoader", async () => {
    const mod = await import("@b4moss/the-wheels-components");
    expect(typeof mod.setPrefix).toBe("function");
    expect(typeof mod.TwSvgLoader).toBe("function");
  });

  it("CJS: setPrefix / TwSvgLoader", () => {
    const mod = require("@b4moss/the-wheels-components") as Record<
      string,
      unknown
    >;
    expect(typeof mod.setPrefix).toBe("function");
    expect(typeof mod.TwSvgLoader).toBe("function");
  });
});

describe("style 再エクスポート", () => {
  it("resolves @b4moss/the-wheels/style to full CSS", () => {
    const resolved = require.resolve("@b4moss/the-wheels/style");
    expect(existsSync(resolved)).toBe(true);
    const css = readFileSync(resolved, "utf8");
    expect(css.includes("@import")).toBe(true);
    expect(css.includes("@b4moss/the-wheels-style")).toBe(true);
  });

  it("resolves partial CSS via style package", () => {
    const resolved = require.resolve("@b4moss/the-wheels-style/css/tokens");
    expect(existsSync(resolved)).toBe(true);
  });
});

describe("公開 API 面の最低セット（umbrella）", () => {
  it("lists required named exports", async () => {
    const mod = await import("@b4moss/the-wheels");
    for (const name of REQUIRED_UMBRELLA_EXPORTS) {
      expect(mod[name], `missing export: ${name}`).toBeTypeOf("function");
    }
  });
});

describe("repo layout sanity", () => {
  it("smoke test lives under reconstruct root", () => {
    expect(existsSync(join(root, "package.json"))).toBe(true);
    expect(
      pathToFileURL(join(root, "packages/the-wheels/package.json")).href,
    ).toMatch(/the-wheels/);
  });
});
