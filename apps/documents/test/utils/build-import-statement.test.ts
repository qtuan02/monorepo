import { describe, expect, it } from "vitest";

import { buildImportStatement } from "~/utils/build-import-statement";

/**
 * The snippet is the one thing on the site a reader copies verbatim, so what is
 * asserted here is the exact text — a stray comma or a missing brace is a line
 * that does not compile in someone else's project.
 */
describe("buildImportStatement", () => {
  it("writes a short export list on one line", () => {
    expect(
      buildImportStatement(
        ["Button", "buttonVariants"],
        "@fe-monorepo/ui/components/button",
      ),
    ).toBe(
      'import { Button, buttonVariants } from "@fe-monorepo/ui/components/button";',
    );
  });

  it("breaks a long list across lines, one name per line with a trailing comma", () => {
    expect(
      buildImportStatement(
        ["Card", "CardContent", "CardHeader", "CardTitle"],
        "@fe-monorepo/ui/components/card",
      ),
    ).toBe(
      [
        "import {",
        "  Card,",
        "  CardContent,",
        "  CardHeader,",
        "  CardTitle,",
        '} from "@fe-monorepo/ui/components/card";',
      ].join("\n"),
    );
  });

  it("falls back to a side-effect import when the module exports no value", () => {
    expect(buildImportStatement([], "@fe-monorepo/ui/globals.css")).toBe(
      'import "@fe-monorepo/ui/globals.css";',
    );
  });
});
