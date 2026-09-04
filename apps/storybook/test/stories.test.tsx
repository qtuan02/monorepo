import type { Meta, StoryFn } from "@storybook/react-vite";
import { composeStories } from "@storybook/react-vite";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

type StoryFile = {
  default: Meta;
  [name: string]: StoryFn | Meta;
};

// Every story file in the workshop, composed with its meta and the preview
// decorators. This suite asserts what Storybook itself cannot: that each story
// renders — and that each overlay actually opens — without throwing.
const storyModules = import.meta.glob<StoryFile>(
  "../src/stories/*.stories.tsx",
  {
    eager: true,
  },
);

// Base UI opens these on hover rather than click.
const HOVER_TRIGGERS = new Set([
  "context-menu-sub-trigger",
  "dropdown-menu-sub-trigger",
  "hover-card-trigger",
  "menubar-sub-trigger",
  "navigation-menu-trigger",
  "tooltip-trigger",
]);

const CONTEXT_MENU_TRIGGERS = new Set(["context-menu-trigger"]);

// Triggers whose content is mounted on open, so its absence afterwards is a real
// failure. Accordion/collapsible/tabs/sidebar render their content inline and
// toggle it, so a click there proves nothing about mounting.
const PORTALED_TRIGGERS = new Set([
  "alert-dialog-trigger",
  "combobox-trigger",
  "context-menu-sub-trigger",
  "context-menu-trigger",
  "dialog-trigger",
  "drawer-trigger",
  "dropdown-menu-sub-trigger",
  "dropdown-menu-trigger",
  "hover-card-trigger",
  "menubar-sub-trigger",
  "menubar-trigger",
  "navigation-menu-trigger",
  "popover-trigger",
  "select-trigger",
  "sheet-trigger",
  "tooltip-trigger",
]);

function slotOf(element: Element) {
  return element.getAttribute("data-slot") ?? "";
}

// `pointerEventsCheck: 0` because an open Base UI overlay marks the rest of the
// document `pointer-events: none` — user-event would refuse the next trigger for
// a reason that is correct behaviour, not a defect.
function createUser() {
  return userEvent.setup({ pointerEventsCheck: 0, delay: null });
}

async function openTrigger(
  user: ReturnType<typeof createUser>,
  trigger: Element,
) {
  const slot = slotOf(trigger);

  if (CONTEXT_MENU_TRIGGERS.has(slot)) {
    await user.pointer({ target: trigger, keys: "[MouseRight]" });
    return;
  }

  if (HOVER_TRIGGERS.has(slot)) {
    await user.hover(trigger);
    return;
  }

  await user.click(trigger);
}

async function openAndAssert(
  user: ReturnType<typeof createUser>,
  trigger: Element,
) {
  await openTrigger(user, trigger);

  const slot = slotOf(trigger);
  if (!PORTALED_TRIGGERS.has(slot)) return;

  // Base UI mounts a popup across a transition, and hover-card/tooltip add an
  // open delay on top — so the content is never there on the same tick.
  const contentSlot = slot.replace(/trigger$/, "content");
  await waitFor(
    () => {
      expect(
        document.querySelector(`[data-slot="${contentSlot}"]`),
        `opening [data-slot="${slot}"] rendered no [data-slot="${contentSlot}"]`,
      ).not.toBeNull();
    },
    { timeout: 3000 },
  );
}

function topLevelTriggers() {
  return Array.from(document.querySelectorAll('[data-slot$="trigger"]')).filter(
    (trigger) => !slotOf(trigger).endsWith("sub-trigger"),
  );
}

// One trigger per render. Opening several in the same tree is what made this
// flaky: an open menubar eats the next click as a dismiss, and closing it first
// is not reliable — a hover-opened popup ignores Escape, and jsdom never
// delivers the pointer-out that would close it. A fresh render has no such
// state to unwind.
async function openEveryTrigger(
  user: ReturnType<typeof createUser>,
  renderStory: () => Promise<void>,
) {
  const count = topLevelTriggers().length;

  for (let index = 0; index < count; index++) {
    if (index > 0) {
      cleanup();
      await renderStory();
    }

    const trigger = topLevelTriggers()[index];
    if (!trigger) continue;

    await openAndAssert(user, trigger);

    // A submenu trigger only exists inside its now-open parent.
    for (const subTrigger of document.querySelectorAll(
      '[data-slot$="sub-trigger"]',
    )) {
      await openAndAssert(user, subTrigger);
    }
  }
}

describe("stories", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // A React error inside a portal is reported, not thrown, so a story can look
    // green while its popup never mounted. Failing on console.error is what turns
    // that back into a test failure.
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  for (const [filePath, storyModule] of Object.entries(storyModules)) {
    const componentName =
      filePath.split("/").pop()?.replace(".stories.tsx", "") ?? filePath;
    const stories = composeStories(storyModule);

    describe(componentName, () => {
      for (const [storyName, Story] of Object.entries(stories)) {
        test(storyName, async () => {
          const user = createUser();
          const renderStory = async () => {
            render(<Story />);
            // Components that measure themselves (slider, scroll-area, charts)
            // settle one tick after mount; flushing here keeps that out of the
            // console.error assertion below as an act() warning.
            await act(async () => {});
          };

          await renderStory();
          await openEveryTrigger(user, renderStory);

          const errors = consoleError.mock.calls.map((call: unknown[]) =>
            call.map(String).join(" "),
          );
          expect(errors, errors.join("\n")).toHaveLength(0);
        });
      }
    });
  }
});
