import { describe, expect, it } from "vitest";

import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODELS,
  isGeminiModel,
} from "~/constants/models";

describe("the model catalogue", () => {
  it("offers the default, so a fresh visit picks a model that exists", () => {
    expect(GEMINI_MODELS.map((model) => model.id)).toContain(
      DEFAULT_GEMINI_MODEL,
    );
  });

  it("lists each id once, so two options cannot share a Select value", () => {
    const ids = GEMINI_MODELS.map((model) => model.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("spells the Gemini 3 preview the way Google's API does", () => {
    // The app this replaced offered `gemini-3.0-pro-preview`, which is not a
    // model on Google's API — picking it 404'd on the first turn, and nothing in
    // the app could tell. Pinned as two literals, deliberately: deriving either
    // from the array under test would let the same rename through again. There
    // is no general rule to check instead — `gemini-2.0-flash` really does
    // carry a minor version, and Gemini 3 really does not.
    const ids = GEMINI_MODELS.map((model) => model.id);

    expect(ids).toContain("gemini-3-pro-preview");
    expect(ids).not.toContain("gemini-3.0-pro-preview");
  });

  it("rejects an id it does not offer", () => {
    expect(isGeminiModel("gemini-2.5-flash")).toBe(true);
    expect(isGeminiModel("gpt-4")).toBe(false);
    expect(isGeminiModel(undefined)).toBe(false);
  });
});
