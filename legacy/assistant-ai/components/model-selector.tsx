"use client";

import type { FC } from "react";
import { SettingsIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui";

import { GEMINI_MODELS } from "../constants/models";
import { useModelStore } from "../stores/model-store";

export const ModelSelector: FC = () => {
  const { selectedModel, setSelectedModel } = useModelStore();

  const currentModel = GEMINI_MODELS.find((m) => m.id === selectedModel);

  const textOutModels = GEMINI_MODELS.filter((m) => m.category === "Text-out");

  return (
    <div>
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger
          size="sm"
          className="aui-model-selector-trigger h-8 w-fit min-w-[200px] justify-center gap-x-2 text-xs"
        >
          <SettingsIcon className="size-3.5 shrink-0" />
          <SelectValue>
            <span className="truncate">{currentModel?.name}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className="w-[280px] bg-white"
          align="end"
          sideOffset={10}
          side="top"
        >
          {textOutModels.length > 0 && (
            <SelectGroup>
              {textOutModels.map((model) => (
                <SelectItem key={model.id} value={model.id} hiddenIcon>
                  <div className="flex w-full flex-col items-start gap-1 p-1">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-medium">{model.name}</span>
                      {selectedModel === model.id && (
                        <span className="text-primary text-xs">✓</span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {model.description}
                    </span>
                    <span className="text-muted-foreground/70 text-[10px] leading-tight">
                      {model.rpm} RPM • {model.tpm} TPM • {model.rpd} RPD
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
