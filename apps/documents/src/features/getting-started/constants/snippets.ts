import type { CodeToken } from "~/types/code-token";
import { HOOK_PACKAGE_NAME, UI_PACKAGE_NAME } from "~/constants/packages";

/**
 * The snippets a consumer copies verbatim, cut into the runs `CodeBlock`
 * colours — a keyword, a string, a comment — with plain text between them.
 * They are content rather than configuration, so they sit beside the only
 * screen that renders them. The stylesheet and theme lines are quoted verbatim
 * from packages/ui-public/README.md — the surface the publish ticket settled,
 * so change them there first; the two examples are the READMEs' own, cut to
 * the one line that shows a subpath import.
 */
const keyword = (text: string): CodeToken => ({ kind: "keyword", text });
const string = (text: string): CodeToken => ({ kind: "string", text });
const comment = (text: string): CodeToken => ({ kind: "comment", text });

const STYLESHEET_IMPORTS: readonly CodeToken[] = [
  keyword("@import"),
  " ",
  string('"tailwindcss"'),
  ";\n",
  keyword("@import"),
  " ",
  string(`"${UI_PACKAGE_NAME}/globals.css"`),
  ";",
];

export const STYLESHEET_SNIPPET: readonly CodeToken[] = [
  comment("/* src/index.css */"),
  "\n",
  ...STYLESHEET_IMPORTS,
];

/**
 * The two snippets that carry a comment take it as an argument: a comment is
 * prose, so it is a Locale message the template resolves, never a literal here.
 */
export const themeSnippet = (brandComment: string): readonly CodeToken[] => [
  ...STYLESHEET_IMPORTS,
  "\n\n:root {\n  --primary: oklch(0.55 0.2 260);\n  --primary-foreground: oklch(0.98 0 0);\n  --radius: 0.375rem;\n}\n\n.dark {\n  --primary: oklch(0.7 0.18 260);\n}\n\n",
  comment(brandComment),
  "\n",
  keyword("@theme inline"),
  " {\n  --color-brand: var(--brand);\n}\n:root {\n  --brand: oklch(0.72 0.19 45);\n}",
];

export const FIRST_EXAMPLE_SNIPPET: readonly CodeToken[] = [
  keyword("import"),
  " { Button } ",
  keyword("from"),
  " ",
  string(`"${UI_PACKAGE_NAME}/components/button"`),
  ";\n",
  keyword("import"),
  " { cn } ",
  keyword("from"),
  " ",
  string(`"${UI_PACKAGE_NAME}/utils/cn"`),
  ";\n\n",
  keyword("export function"),
  " SaveRow({ busy }: { busy: boolean }) {\n  ",
  keyword("return"),
  " <Button className={cn(busy && ",
  string('"opacity-50"'),
  ")}>Save</Button>;\n}",
];

export const hookExampleSnippet = (
  usageComment: string,
): readonly CodeToken[] => [
  keyword("import"),
  " { useState } ",
  keyword("from"),
  " ",
  string('"react"'),
  ";\n",
  keyword("import"),
  " { useDebounce } ",
  keyword("from"),
  " ",
  string(`"${HOOK_PACKAGE_NAME}/use-debounce"`),
  ";\n\n",
  keyword("export function"),
  " SearchBox() {\n  ",
  keyword("const"),
  " [search, setSearch] = useState(",
  string('""'),
  ");\n  ",
  keyword("const"),
  " debouncedSearch = useDebounce(search, 500);\n  ",
  comment(usageComment),
  "\n}",
];

export const NO_ROOT_ENTRY_SNIPPET: readonly CodeToken[] = [
  keyword("import"),
  " { Button } ",
  keyword("from"),
  " ",
  string(`"${UI_PACKAGE_NAME}"`),
  ";           ",
  comment("// ✗"),
  "\n",
  keyword("import"),
  " { Button } ",
  keyword("from"),
  " ",
  string(`"${UI_PACKAGE_NAME}/components/button"`),
  "; ",
  comment("// ✓"),
];
