import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GeminiModel } from "~/constants/models";
import { DEFAULT_GEMINI_MODEL, isGeminiModel } from "~/constants/models";

interface ModelStore {
  selectedModel: GeminiModel;
  setSelectedModel: (model: GeminiModel) => void;
}

/**
 * Which Gemini model the next turn is sent to. App-wide client state the user
 * owns — not server state, and not a credential: the only thing persisted is a
 * model id, which is public (it is in `~/constants/models.ts` and in every
 * request body). This app's session, like every Next app here, is an `HttpOnly`
 * cookie, and nothing token-shaped is ever put in a store.
 *
 * The `persist` middleware replaces the app this migrated from, which read and
 * wrote `localStorage` by hand inside the store initialiser. That version ran on
 * the server too, where `window` is undefined, so it had a `typeof window`
 * guard and still produced a first client render that disagreed with the
 * server's HTML. `persist` hydrates after mount, which is the shape that does
 * not tear.
 */
export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      selectedModel: DEFAULT_GEMINI_MODEL,
      setSelectedModel: (selectedModel) => set({ selectedModel }),
    }),
    {
      name: "assistant-ai-model",
      // A model can be retired between two visits, so what comes back out of
      // localStorage is untrusted the same way a request body is.
      merge: (persisted, current) => {
        const selectedModel = (persisted as Partial<ModelStore> | undefined)
          ?.selectedModel;

        return {
          ...current,
          selectedModel: isGeminiModel(selectedModel)
            ? selectedModel
            : current.selectedModel,
        };
      },
    },
  ),
);
