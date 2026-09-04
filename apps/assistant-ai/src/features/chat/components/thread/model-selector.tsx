"use client";

import { SettingsIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";

import type { GeminiModel } from "~/constants/models";
import { GEMINI_MODELS } from "~/constants/models";
import { useModelStore } from "~/stores/use-model-store";

/**
 * Which model the next turn goes to. Two narrow selectors rather than one
 * destructured store read, so this only re-renders when the value it shows
 * changes (`.agents/rules/zustand-global.md`).
 */
export default function ModelSelector() {
  const t = useTranslations("assistantAi.chat");
  const tModel = useTranslations("assistantAi.models");
  const selectedModel = useModelStore((state) => state.selectedModel);
  const setSelectedModel = useModelStore((state) => state.setSelectedModel);

  const currentModel = GEMINI_MODELS.find(
    (model) => model.id === selectedModel,
  );

  return (
    <Select
      value={selectedModel}
      onValueChange={(value) => setSelectedModel(value as GeminiModel)}
    >
      <SelectTrigger
        aria-label={t("modelLabel")}
        className="h-8 w-fit min-w-[13rem] justify-center gap-x-2 text-xs"
        size="sm"
      >
        <SettingsIcon className="size-3.5 shrink-0" />
        {/* Children rather than the raw value: without them Base UI renders the
            model id instead of its display name. */}
        <SelectValue>
          <span className="truncate">{currentModel?.name}</span>
        </SelectValue>
      </SelectTrigger>

      <SelectContent align="end" className="w-[17.5rem]" side="top">
        {GEMINI_MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <span className="flex w-full flex-col items-start gap-1 py-1">
              <span className="text-sm font-medium">{model.name}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {tModel(model.descriptionKey)}
              </span>
              <span className="text-[0.625rem] leading-tight text-muted-foreground/70">
                {t("modelQuota", {
                  rpm: model.rpm,
                  tpm: model.tpm,
                  rpd: model.rpd,
                })}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
