"use client";

import { create } from "zustand";

import type { GeminiModel } from "../constants/models";
import { GEMINI_MODELS } from "../constants/models";

interface ModelStore {
  selectedModel: GeminiModel;
  setSelectedModel: (model: GeminiModel) => void;
}

const getStoredModel = (): GeminiModel => {
  if (typeof window === "undefined") return "gemini-2.5-flash";
  const stored = localStorage.getItem("assistant-ai-model");
  if (stored && GEMINI_MODELS.some((m) => m.id === stored)) {
    return stored as GeminiModel;
  }
  return "gemini-2.5-flash";
};

export const useModelStore = create<ModelStore>((set) => ({
  selectedModel: getStoredModel(),
  setSelectedModel: (model) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("assistant-ai-model", model);
    }
    set({ selectedModel: model });
  },
}));

