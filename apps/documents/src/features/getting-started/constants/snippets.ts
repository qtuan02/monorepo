import type { CodeToken } from "~/types/code-token";
import { UI_PACKAGE_NAME } from "~/constants/packages";

/**
 * The three snippets a consumer copies verbatim, cut into the runs `CodeBlock`
 * colours — a keyword, a string, a comment — with plain text between them.
 * They are content rather than configuration, so they sit beside the only
 * screen that renders them. The stylesheet lines are quoted verbatim from
 * packages/ui-public/README.md — the surface the publish ticket settled, so
 * change them there first; the example is that README's `SaveRow`, cut to
 * the one line that shows a subpath import.
 */
const keyword = (text: string): CodeToken => ({ kind: "keyword", text });
const string = (text: string): CodeToken => ({ kind: "string", text });
const comment = (text: string): CodeToken => ({ kind: "comment", text });

export const STYLESHEET_SNIPPET: readonly CodeToken[] = [
  comment("/* src/index.css */"),
  "\n",
  keyword("@import"),
  " ",
  string('"tailwindcss"'),
  ";\n",
  keyword("@import"),
  " ",
  string(`"${UI_PACKAGE_NAME}/globals.css"`),
  ";\n\n",
  keyword("@source"),
  " ",
  string(`"../node_modules/${UI_PACKAGE_NAME}/dist"`),
  ";",
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
