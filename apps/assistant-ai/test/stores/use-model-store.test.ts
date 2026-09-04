import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_GEMINI_MODEL } from "~/constants/models";
import { useModelStore } from "~/stores/use-model-store";

describe("the model store", () => {
  beforeEach(() => {
    localStorage.clear();
    useModelStore.setState({ selectedModel: DEFAULT_GEMINI_MODEL });
  });

  it("starts on the default model", () => {
    expect(useModelStore.getState().selectedModel).toBe(DEFAULT_GEMINI_MODEL);
  });

  it("keeps what the visitor picked", () => {
    useModelStore.getState().setSelectedModel("gemini-2.5-pro");

    expect(useModelStore.getState().selectedModel).toBe("gemini-2.5-pro");
  });

  it("restores a persisted model on rehydration", async () => {
    localStorage.setItem(
      "assistant-ai-model",
      JSON.stringify({
        state: { selectedModel: "gemini-2.5-pro" },
        version: 0,
      }),
    );

    await useModelStore.persist.rehydrate();

    expect(useModelStore.getState().selectedModel).toBe("gemini-2.5-pro");
  });

  it("falls back to the default when the persisted model was retired", async () => {
    // A model dropped from `~/constants/models.ts` between two visits is still
    // sitting in that visitor's localStorage. Trusting it would send an id the
    // Select cannot show and the API does not know.
    localStorage.setItem(
      "assistant-ai-model",
      JSON.stringify({
        state: { selectedModel: "gemini-1.0-ultra" },
        version: 0,
      }),
    );

    await useModelStore.persist.rehydrate();

    expect(useModelStore.getState().selectedModel).toBe(DEFAULT_GEMINI_MODEL);
  });
});
