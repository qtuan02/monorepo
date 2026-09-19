import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Round 4's four-tier text scale (README § Hình dạng round 4): trang
 * 20/600 · mục 15/600 · thân 14/400 · meta 12/400, weight 600 the one
 * exception outside "thân" (tiền). None of the four tiers is Tailwind's
 * default `text-2xl`/`text-xl` (24px/20px) or `font-bold` (700) — those
 * three classes are the seven-bold-size mess round 4 replaces (brief §1),
 * so "trang" and "mục" are written as `text-[20px]`/`text-[15px]` instead,
 * which lets a literal text scan tell "the new tier" from "the old scale"
 * without parsing a class's weight.
 *
 * `lucide-react` is banned in a `*-columns.tsx` file: a table cell states
 * the value, header text already says what it is (brief §1.3).
 *
 * No allowlist: T1 (#242) opened this guard with one so T2–T7 could convert
 * incrementally; T8 (#249) removed it once every file in scope converted.
 */
const appRoot = process.cwd();

function toRelPath(absolute: string): string {
  return relative(appRoot, absolute).split("\\").join("/");
}

function collectFiles(
  dir: string,
  matches: (name: string) => boolean,
): string[] {
  const root = resolve(appRoot, dir);
  if (!existsSync(root)) return [];
  return readdirSync(root, { recursive: true })
    .filter(
      (entry): entry is string => typeof entry === "string" && matches(entry),
    )
    .map((entry) => resolve(root, entry));
}

function collectTemplateFiles(): string[] {
  const featuresRoot = resolve(appRoot, "src/features");
  const files: string[] = [];
  for (const feature of readdirSync(featuresRoot, { withFileTypes: true })) {
    if (!feature.isDirectory()) continue;
    files.push(
      ...collectFiles(
        `src/features/${feature.name}/templates`,
        (name) => name.endsWith(".ts") || name.endsWith(".tsx"),
      ),
    );
  }
  return files;
}

function collectColumnFiles(): string[] {
  const featuresRoot = resolve(appRoot, "src/features");
  const files: string[] = [];
  for (const feature of readdirSync(featuresRoot, { withFileTypes: true })) {
    if (!feature.isDirectory()) continue;
    const componentsDir = resolve(featuresRoot, feature.name, "components");
    if (!existsSync(componentsDir)) continue;
    for (const entry of readdirSync(componentsDir)) {
      if (entry.endsWith("-columns.tsx"))
        files.push(resolve(componentsDir, entry));
    }
  }
  return files;
}

const BANNED_TEXT_CLASSES = [/\btext-2xl\b/, /\btext-xl\b/, /\bfont-bold\b/];

const textScaleFiles = [
  ...collectFiles(
    "src/components",
    (name) => name.endsWith(".ts") || name.endsWith(".tsx"),
  ),
  ...collectTemplateFiles(),
]
  .map(toRelPath)
  .sort((a, b) => a.localeCompare(b));

const columnFiles = collectColumnFiles()
  .map(toRelPath)
  .sort((a, b) => a.localeCompare(b));

describe("round 4 four-tier text scale — src/components/** + src/features/**/templates/**", () => {
  it("covers at least one file", () => {
    expect(textScaleFiles.length).toBeGreaterThan(0);
  });

  it.each(textScaleFiles)(
    "%s carries no text-2xl/text-xl/font-bold",
    (relPath) => {
      const source = readFileSync(resolve(appRoot, relPath), "utf8");
      expect(BANNED_TEXT_CLASSES.some((pattern) => pattern.test(source))).toBe(
        false,
      );
    },
  );
});

describe("round 4 column files carry no decorative lucide-react icon", () => {
  it("covers at least one file", () => {
    expect(columnFiles.length).toBeGreaterThan(0);
  });

  it.each(columnFiles)("%s imports no lucide-react", (relPath) => {
    const source = readFileSync(resolve(appRoot, relPath), "utf8");
    expect(source).not.toContain("lucide-react");
  });
});
