import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  buildCatalogue,
  buildDocsEntry,
  COMPONENT_SOURCE,
  HOOK_SOURCE,
  parseDocsModule,
  toStorybookDocsId,
  toStorybookExampleId,
} from "../../scripts/docs-metadata";

/**
 * The generator's pure half, over two fixture modules written to a temp
 * directory rather than checked in: `parseSync` decides between TS and TSX from
 * the file name, so a fixture has to keep its real extension — and a `.tsx`
 * under `test/` would then be type-checked as app source.
 *
 * The fixtures are deliberately awkward in the ways a regex would get wrong: an
 * `export {}` list split across lines, a re-export list carrying a type, a
 * default export, and a JSDoc block that documents an import rather than the
 * module.
 */
const COMPONENT_FIXTURE = `import type { ReactNode } from "react";

/** Documents the import above, not the module — must NOT become the description. */
import { cn } from "#utils/cn";

/**
 * A fake primitive.
 * Second line of the same block.
 */
export function FakeThing({ children }: { children: ReactNode }) {
  return <span className={cn("x")}>{children}</span>;
}

export const fakeThingVariants = () => "x";

export type FakeThingProps = { children: ReactNode };

export {
  FakeThing as AliasedThing,
  fakeThingVariants as aliasedVariants,
};

export default FakeThing;
`;

const HOOK_FIXTURE = `import { useState } from "react";

/** A fake hook. */
export function useFakeThing(): number {
  const [value] = useState(1);
  return value;
}
`;

/**
 * One block carrying both things the generator reads — the description and an
 * `@example` — plus a tag after the example, which is where the example has to
 * stop. The example keeps its blank line and its indent.
 */
const EXAMPLE_FIXTURE = `/**
 * Counts renders.
 *
 * @example
 * const count = useRenderCount();
 *
 * if (count > 1) {
 *   console.log("re-rendered");
 * }
 * @returns the number of renders so far
 */
export function useRenderCount(): number {
  return 1;
}
`;

/** The hook is the second export, and the only one carrying a JSDoc. */
const LATER_EXPORT_FIXTURE = `export const LIMIT = 768;

/**
 * Below the limit.
 * @example const mobile = useBelowLimit();
 */
export function useBelowLimit(): boolean {
  return false;
}
`;

let fixtureDirectory: string;

beforeAll(() => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), "docs-metadata-"));
  writeFileSync(join(fixtureDirectory, "fake-thing.tsx"), COMPONENT_FIXTURE);
  writeFileSync(join(fixtureDirectory, "use-fake-thing.ts"), HOOK_FIXTURE);
  // Neither extension the two sources read — proves the filter, not the sort.
  writeFileSync(join(fixtureDirectory, "readme.md"), "# not a module\n");
});

afterAll(() => {
  rmSync(fixtureDirectory, { recursive: true, force: true });
});

describe("parseDocsModule", () => {
  it("collects every named value export, sorted, across declaration and list forms", () => {
    const { exports } = parseDocsModule("fake-thing.tsx", COMPONENT_FIXTURE);

    expect(exports).toEqual([
      "AliasedThing",
      "aliasedVariants",
      "FakeThing",
      "fakeThingVariants",
    ]);
  });

  it("drops `export type` and the default export", () => {
    const { exports } = parseDocsModule("fake-thing.tsx", COMPONENT_FIXTURE);

    // A consumer's export table lists what they can call. `FakeThingProps` is a
    // type, and the packages publish no default export at any subpath.
    expect(exports).not.toContain("FakeThingProps");
    expect(exports).not.toContain("default");
  });

  it("takes the JSDoc block directly above the first exported declaration", () => {
    const { description } = parseDocsModule(
      "fake-thing.tsx",
      COMPONENT_FIXTURE,
    );

    expect(description).toBe(
      "A fake primitive. Second line of the same block.",
    );
  });

  it("ignores a JSDoc block that documents something other than that declaration", () => {
    const { description } = parseDocsModule(
      "fake-thing.tsx",
      COMPONENT_FIXTURE,
    );

    expect(description).not.toContain("Documents the import above");
  });

  it("cuts the description at the first tag and keeps the example's lines verbatim", () => {
    const { description, example } = parseDocsModule(
      "use-render-count.ts",
      EXAMPLE_FIXTURE,
    );

    expect(description).toBe("Counts renders.");
    expect(example).toBe(
      [
        "const count = useRenderCount();",
        "",
        "if (count > 1) {",
        '  console.log("re-rendered");',
        "}",
      ].join("\n"),
    );
  });

  it("returns a null example when the block has no @example tag", () => {
    const { example } = parseDocsModule("use-fake-thing.ts", HOOK_FIXTURE);

    expect(example).toBeNull();
  });

  it("reads an @example written on the tag's own line, off a later export", () => {
    // `use-is-mobile` exports its breakpoint before its hook: the block that
    // describes the module sits on the first export that carries one.
    const { description, example } = parseDocsModule(
      "use-below-limit.ts",
      LATER_EXPORT_FIXTURE,
    );

    expect(description).toBe("Below the limit.");
    expect(example).toBe("const mobile = useBelowLimit();");
  });

  it("returns null when the module carries no JSDoc at all", () => {
    const { description } = parseDocsModule(
      "bare.ts",
      "export const value = 1;\n",
    );

    expect(description).toBeNull();
  });

  it("throws, naming the file, rather than returning a half-read module", () => {
    // Silence beats a wrong export table: a file that does not parse is a bug in
    // the source package, and the build should say which file.
    expect(() => parseDocsModule("broken.ts", "export const = ;")).toThrow(
      /broken\.ts/,
    );
  });
});

describe("buildDocsEntry", () => {
  it("derives the slug, the published subpath and the consumer's specifier", () => {
    const entry = buildDocsEntry(
      COMPONENT_SOURCE,
      "fake-thing.tsx",
      COMPONENT_FIXTURE,
    );

    expect(entry).toMatchObject({
      slug: "fake-thing",
      subpath: "components/fake-thing",
      importPath: "@fe-monorepo/ui/components/fake-thing",
    });
  });

  it("gives a hook the bare file name as its subpath — the hook package has no prefix", () => {
    const entry = buildDocsEntry(
      HOOK_SOURCE,
      "use-fake-thing.ts",
      HOOK_FIXTURE,
    );

    expect(entry).toMatchObject({
      slug: "use-fake-thing",
      subpath: "use-fake-thing",
      importPath: "@fe-monorepo/hook/use-fake-thing",
      exports: ["useFakeThing"],
      storybookDocsId: "hooks-usefakething",
      storybookExampleId: "hooks-usefakething--default",
    });
  });
});

describe("toStorybookDocsId", () => {
  it("collapses the dashes the way Storybook slugifies `Storybook/<Name>`", () => {
    expect(toStorybookDocsId("alert-dialog")).toBe("storybook-alertdialog");
    expect(toStorybookDocsId("button")).toBe("storybook-button");
  });

  it("uses the override where the story is named after the export, not the file", () => {
    expect(toStorybookDocsId("direction")).toBe("storybook-directionprovider");
  });

  it("starts a hook's id with the `Hooks/` prefix its titles carry", () => {
    expect(toStorybookDocsId("use-debounce", "hooks")).toBe(
      "hooks-usedebounce",
    );
    expect(toStorybookExampleId("use-debounce", "hooks")).toBe(
      "hooks-usedebounce--default",
    );
  });
});

describe("toStorybookExampleId", () => {
  it("names the `Default` story under the docs id", () => {
    expect(toStorybookExampleId("button")).toBe("storybook-button--default");
    expect(toStorybookExampleId("direction")).toBe(
      "storybook-directionprovider--default",
    );
  });

  it("uses the override for the one stories file with no `Default` story", () => {
    expect(toStorybookExampleId("accordion")).toBe(
      "storybook-accordion--single",
    );
  });
});

describe("buildCatalogue", () => {
  it("reads only the source extension, in a stable order", () => {
    const catalogue = buildCatalogue(COMPONENT_SOURCE, fixtureDirectory);

    expect(catalogue.items.map((item) => item.slug)).toEqual(["fake-thing"]);
    expect(catalogue.package).toBe("@fe-monorepo/ui");
    expect(catalogue.generatedFrom).toBe("packages/ui/src/components");
  });

  it("reads the same directory as a hook source and finds the other file", () => {
    const catalogue = buildCatalogue(HOOK_SOURCE, fixtureDirectory);

    expect(catalogue.items.map((item) => item.slug)).toEqual([
      "use-fake-thing",
    ]);
  });
});
