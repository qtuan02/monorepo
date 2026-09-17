import type { Meta, StoryObj } from "@storybook/react";
import { describe, expect, test } from "vitest";

type AnyStory = StoryObj<Meta>;

type StoryFile = {
  default: Meta & { subcomponents?: Record<string, unknown> };
  [name: string]: AnyStory | Meta | undefined;
};

// Every story file in the workshop — including `introduction.stories.tsx`,
// which `test/stories.test.tsx` deliberately excludes by globbing only
// `src/stories/*`.
const storyModules = import.meta.glob<StoryFile>("../src/**/*.stories.tsx", {
  eager: true,
});

const STAGE_WIDTHS = new Set(["sm", "md", "lg", "full"]);

// Ticket #169 (foundation) standardizes only these two files as the samples
// the eight family tickets copy from. Each family ticket appends its own slugs
// here; the ticket that closes the spec deletes this list so every check below
// runs against all 82 story files at once instead of two.
const STANDARDIZED = new Set(["button", "dialog"]);

// `accordion` is the one file the `Default`-export contract does not reach —
// `apps/documents/README.md` documents it as an intentional exception (its two
// stories are `Single`/`Multiple`; the generator's own override table picks
// `single`, checked by `apps/documents/test/generated/catalogue-invariants.test.ts`).
// Out of scope for this spec to change; mirrored here rather than left for this
// suite to flag as a false regression.
const NO_DEFAULT_EXPORT = new Set(["accordion"]);

function slugOf(filePath: string) {
  return filePath.split("/").pop()?.replace(".stories.tsx", "") ?? filePath;
}

function storyEntries(storyModule: StoryFile) {
  return Object.entries(storyModule).filter(
    (entry): entry is [string, AnyStory] => entry[0] !== "default",
  );
}

describe("story conventions", () => {
  for (const [filePath, storyModule] of Object.entries(storyModules)) {
    const slug = slugOf(filePath);
    const meta = storyModule.default;
    const isIntroduction = meta.title === "Introduction";

    describe(slug, () => {
      test("title sits under Storybook/, Hooks/, or is the top-level Introduction", () => {
        if (isIntroduction) return;
        expect(
          meta.title?.startsWith("Storybook/") ||
            meta.title?.startsWith("Hooks/"),
          `"${meta.title}" must start with "Storybook/" or "Hooks/"`,
        ).toBe(true);
      });

      test("exports a Default story", () => {
        // The Introduction module keeps its own story name (`Welcome`) — see
        // ADR-free decision in spec #168's "Contract với documents" section:
        // the generator never derives an id from it, so nothing depends on it
        // being named Default.
        if (isIntroduction || NO_DEFAULT_EXPORT.has(slug)) return;
        expect(
          storyModule.Default,
          `${filePath} has no Default export`,
        ).toBeDefined();
      });

      test("parameters.stage.width, when set, is on the sm/md/lg/full scale", () => {
        const candidates: (Meta | AnyStory)[] = [
          meta,
          ...storyEntries(storyModule).map(([, story]) => story),
        ];

        for (const candidate of candidates) {
          const width = candidate.parameters?.stage?.width;
          if (width === undefined) continue;
          expect(
            STAGE_WIDTHS.has(width),
            `stage.width "${width}" in ${filePath} is not sm/md/lg/full`,
          ).toBe(true);
        }
      });

      if (STANDARDIZED.has(slug)) {
        test("Default follows the leaf/compound args policy", () => {
          const Default = storyModule.Default as AnyStory | undefined;
          if (!Default) return;

          if (typeof Default.render === "function") {
            // Compound primitive: Default keeps `render`, so Controls must be
            // off and the anatomy must be listed as subcomponents.
            expect(Default.parameters?.controls?.disable).toBe(true);
            expect(
              meta.subcomponents !== undefined &&
                Object.keys(meta.subcomponents).length > 0,
              `${filePath}'s meta has no subcomponents`,
            ).toBe(true);
          } else if (meta.title?.startsWith("Storybook/")) {
            // Leaf primitive under Storybook/: Default runs on args, so the
            // Controls tab needs explicit argTypes to stay alive. Hooks/ is
            // exempt — a hook's Demo component takes no props.
            expect(
              meta.argTypes !== undefined &&
                Object.keys(meta.argTypes).length > 0,
              `${filePath}'s meta has no argTypes`,
            ).toBe(true);
          }
        });
      }
    });
  }
});
