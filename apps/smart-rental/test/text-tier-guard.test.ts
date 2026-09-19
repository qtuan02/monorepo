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
 * ALLOWLIST holds every file that still violates a rule when this ticket
 * (#242) opened the guard — T2–T7 remove their own files from it as they
 * convert; T8 deletes the allowlist outright. A file this ticket itself
 * converted is never listed.
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

const TEXT_SCALE_ALLOWLIST = new Set([
  "src/components/avatar/tenant-avatar.tsx",
  "src/components/dialog/vietqr-dialog.tsx",
  "src/components/exception/internal-server-error.tsx",
  "src/components/exception/not-found.tsx",
  "src/components/page/detail-page-shell.tsx",
  "src/features/auth/templates/auth-layout.template.tsx",
  "src/features/contracts/templates/contract-create.template.tsx",
  "src/features/contracts/templates/contract-detail.template.tsx",
  "src/features/contracts/templates/contract-liquidation.template.tsx",
  "src/features/invoices/templates/invoice-detail.template.tsx",
]);

const LUCIDE_COLUMNS_ALLOWLIST = new Set([
  "src/features/expenses/components/expense-columns.tsx",
  "src/features/invoices/components/invoice-columns.tsx",
  "src/features/supplier-bills/components/supplier-bill-columns.tsx",
  "src/features/tenants/components/tenant-columns.tsx",
  "src/features/utilities/components/utility-columns.tsx",
]);

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
  it("covers at least every file the allowlist names", () => {
    const covered = new Set(textScaleFiles);
    for (const relPath of TEXT_SCALE_ALLOWLIST) {
      expect(covered.has(relPath)).toBe(true);
    }
  });

  it.each(textScaleFiles)(
    "%s carries no text-2xl/text-xl/font-bold, unless allowlisted",
    (relPath) => {
      if (TEXT_SCALE_ALLOWLIST.has(relPath)) return;
      const source = readFileSync(resolve(appRoot, relPath), "utf8");
      expect(BANNED_TEXT_CLASSES.some((pattern) => pattern.test(source))).toBe(
        false,
      );
    },
  );
});

describe("round 4 column files carry no decorative lucide-react icon", () => {
  it.each(columnFiles)(
    "%s imports no lucide-react, unless allowlisted",
    (relPath) => {
      if (LUCIDE_COLUMNS_ALLOWLIST.has(relPath)) return;
      const source = readFileSync(resolve(appRoot, relPath), "utf8");
      expect(source).not.toContain("lucide-react");
    },
  );
});
