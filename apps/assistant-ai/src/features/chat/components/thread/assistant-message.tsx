"use client";

import {
  ActionBarPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { CheckIcon, CopyIcon, RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import BranchPicker from "./branch-picker";
import MarkdownText from "./markdown-text";
import { Reasoning, ReasoningGroup } from "./reasoning";
import ToolFallback from "./tool-fallback";
import TooltipIconButton from "./tooltip-icon-button";

/**
 * One assistant turn: its parts, then the error region, then the actions.
 *
 * `MessagePrimitive.Error` is what a failed turn lands in — the route handler
 * classifies the failure and sends one catalogue string
 * (`~/features/chat/utils/chat-error-code.ts`), so this renders it rather than
 * deciding anything itself. It is also the seam the E2E asserts on: a broken key
 * has to end as visible text here, never as a spinner that never stops.
 */
export default function AssistantMessage() {
  const t = useTranslations("assistantAi.chat");

  return (
    <MessagePrimitive.Root asChild>
      <div
        className="relative mx-auto w-full max-w-(--thread-max-width) py-4 last:mb-24 animate-in fade-in slide-in-from-bottom-1 duration-150 ease-out"
        data-role="assistant"
      >
        <div className="mx-2 leading-7 break-words text-foreground">
          <MessagePrimitive.Parts
            components={{
              Text: MarkdownText,
              Reasoning,
              ReasoningGroup,
              tools: { Fallback: ToolFallback },
            }}
          />

          <MessagePrimitive.Error>
            <ErrorPrimitive.Root
              role="alert"
              className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
            >
              <ErrorPrimitive.Message />
            </ErrorPrimitive.Root>
          </MessagePrimitive.Error>
        </div>

        <div className="mt-2 ml-2 flex">
          <BranchPicker />
          <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            autohideFloat="single-branch"
            className="-ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
          >
            <ActionBarPrimitive.Copy asChild>
              <TooltipIconButton tooltip={t("copy")}>
                <MessagePrimitive.If copied>
                  <CheckIcon />
                </MessagePrimitive.If>
                <MessagePrimitive.If copied={false}>
                  <CopyIcon />
                </MessagePrimitive.If>
              </TooltipIconButton>
            </ActionBarPrimitive.Copy>
            <ActionBarPrimitive.Reload asChild>
              <TooltipIconButton tooltip={t("regenerate")}>
                <RefreshCwIcon />
              </TooltipIconButton>
            </ActionBarPrimitive.Reload>
          </ActionBarPrimitive.Root>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}
