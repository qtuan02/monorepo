"use client";

import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@monorepo/ui/components/collapsible";

/**
 * What an MCP tool call looks like in the thread while no tool has a renderer of
 * its own: the tool's name, and its arguments and result behind a fold.
 *
 * Collapsed by default — the model is instructed to write a summary of every
 * tool result (see `~/features/chat/server/stream-chat.ts`), so the JSON here is
 * for someone checking the answer rather than for reading first.
 */
const ToolFallback: ToolCallMessagePartComponent = ({
  toolName,
  argsText,
  result,
}) => {
  const t = useTranslations("assistantAi.chat");

  return (
    <Collapsible className="mb-4 flex w-full flex-col gap-3 rounded-lg border py-3">
      <CollapsibleTrigger
        aria-label={t("toolToggle")}
        className="group/trigger flex items-center gap-2 px-4 text-left"
      >
        <CheckIcon className="size-4 shrink-0" />
        <span className="flex-grow">{t("toolUsed", { name: toolName })}</span>
        <ChevronDownIcon className="size-4 shrink-0 -rotate-90 transition-transform duration-200 ease-out group-aria-expanded/trigger:rotate-0" />
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-2 border-t pt-2">
        <div className="px-4">
          <p className="font-semibold">{t("toolArguments")}</p>
          <pre className="overflow-x-auto whitespace-pre-wrap">{argsText}</pre>
        </div>

        {result !== undefined && (
          <div className="border-t border-dashed px-4 pt-2">
            <p className="font-semibold">{t("toolResult")}</p>
            <pre className="overflow-x-auto whitespace-pre-wrap">
              {typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ToolFallback;
