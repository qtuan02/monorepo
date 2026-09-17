import { composeStory } from "@storybook/react-vite";
import { cleanup, render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import * as IntroductionStories from "../src/introduction.stories";
import * as ButtonStories from "../src/stories/button.stories";

// These exercise the preview.tsx decorator itself — stage panel, stage width,
// theme sync — rather than any one component's behaviour, which is what
// test/stories.test.tsx and test/story-conventions.test.tsx already cover.

describe("preview decorators", () => {
  test("theme=dark syncs the dark class onto documentElement, theme=light clears it", () => {
    const Dark = composeStory(ButtonStories.Default, ButtonStories.default, {
      initialGlobals: { theme: "dark" },
    });
    render(<Dark />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    cleanup();

    const Light = composeStory(ButtonStories.Default, ButtonStories.default, {
      initialGlobals: { theme: "light" },
    });
    render(<Light />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    cleanup();
  });

  test("parameters.stage.width sizes the stage's inner wrapper", () => {
    const Small = composeStory(
      {
        ...ButtonStories.Default,
        parameters: {
          ...ButtonStories.Default.parameters,
          stage: { width: "sm" },
        },
      },
      ButtonStories.default,
    );

    const { getByTestId } = render(<Small />);
    expect(getByTestId("storybook-stage-content").className).toContain(
      "max-w-sm",
    );
  });

  test("layout: fullscreen renders with no stage", () => {
    const Fullscreen = composeStory(
      IntroductionStories.Welcome,
      IntroductionStories.default,
    );

    const { queryByTestId } = render(<Fullscreen />);
    expect(queryByTestId("storybook-stage")).toBeNull();
  });
});
