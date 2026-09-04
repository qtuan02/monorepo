"use client";

import type { CSSProperties } from "react";
import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { ArrowDownIcon, ArrowUpIcon, SquareIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { TooltipProvider } from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

import { CHAT_SUGGESTION_KEYS } from "../../constants/suggestions";
import { AssistantMessage } from "./assistant-message";
import { EditComposer } from "./edit-composer";
import { ModelSelector } from "./model-selector";
import { UserMessage } from "./user-message";

/**
 * The chat surface. `--thread-max-width` is set once here and read by every
 * message row below, which is the one measurement several sibling files have to
 * agree on (`.agents/rules/quality-styling-tailwind.md`).
 */
export function Thread() {
  return (
    <TooltipProvider>
      <ThreadPrimitive.Root
        className="@container flex min-h-0 flex-1 flex-col bg-background"
        style={{ "--thread-max-width": "44rem" } as CSSProperties}
      >
        <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll px-4">
          <div className="sticky top-0 z-10 mb-2 flex justify-end bg-background/80 py-2 backdrop-blur-sm">
            <ModelSelector />
          </div>

          <ThreadPrimitive.If empty>
            <ThreadWelcome />
          </ThreadPrimitive.If>

          <ThreadPrimitive.Messages
            components={{ UserMessage, EditComposer, AssistantMessage }}
          />

          <ThreadPrimitive.If empty={false}>
            <div className="min-h-8 grow" />
          </ThreadPrimitive.If>

          <Composer />
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </TooltipProvider>
  );
}

function ThreadWelcome() {
  const t = useTranslations("assistantAi.chat");

  return (
    <div className="mx-auto my-auto flex w-full max-w-(--thread-max-width) grow flex-col">
      <div className="flex w-full grow flex-col items-center justify-center">
        <div className="flex size-full flex-col justify-center px-8">
          <h1 className="text-2xl font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300">
            {t("welcomeTitle")}
          </h1>
          <p className="text-2xl text-muted-foreground/65 animate-in fade-in slide-in-from-bottom-2 delay-100 duration-300 fill-mode-both">
            {t("welcomeSubtitle")}
          </p>
        </div>
      </div>

      <ThreadSuggestions />
    </div>
  );
}

function ThreadSuggestions() {
  const t = useTranslations("assistantAi.suggestions");

  return (
    <div className="grid w-full gap-2 pb-4 @md:grid-cols-2">
      {CHAT_SUGGESTION_KEYS.map((key) => {
        const title = t(`${key}.title`);
        const label = t(`${key}.label`);

        return (
          <ThreadPrimitive.Suggestion
            key={key}
            send
            asChild
            prompt={`${title} ${label}`}
          >
            <Button
              aria-label={`${title} ${label}`}
              className="h-auto w-full flex-wrap items-start justify-start gap-1 rounded-2xl border px-4 py-3 text-left text-sm transition-colors hover:bg-muted @md:flex-col"
              variant="ghost"
            >
              <span className="font-medium">{title}</span>
              <span className="text-muted-foreground">{label}</span>
            </Button>
          </ThreadPrimitive.Suggestion>
        );
      })}
    </div>
  );
}

function Composer() {
  const t = useTranslations("assistantAi.chat");

  return (
    <div className="sticky bottom-0 mx-auto flex w-full max-w-(--thread-max-width) flex-col gap-4 overflow-visible rounded-t-3xl bg-background pb-4 md:pb-6">
      <ThreadPrimitive.ScrollToBottom asChild>
        <button
          aria-label={t("scrollToBottom")}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "absolute -top-12 z-10 size-[2.125rem] self-center rounded-full disabled:invisible",
          )}
          type="button"
        >
          <ArrowDownIcon />
        </button>
      </ThreadPrimitive.ScrollToBottom>

      <ComposerPrimitive.Root className="relative flex w-full flex-col rounded-3xl border border-input bg-background px-1 pt-2 shadow-xs transition-[color,box-shadow] outline-none has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-3 has-[textarea:focus-visible]:ring-ring/50">
        <ComposerPrimitive.Input
          autoFocus
          aria-label={t("inputLabel")}
          className="mb-1 max-h-32 min-h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-0"
          placeholder={t("inputPlaceholder")}
          rows={1}
        />

        <div className="relative mx-1 mt-2 mb-2 flex items-center justify-end">
          <ThreadPrimitive.If running={false}>
            <ComposerPrimitive.Send asChild>
              <Button
                aria-label={t("send")}
                className="size-[2.125rem] rounded-full p-1"
                size="icon"
                type="submit"
              >
                <ArrowUpIcon className="size-5" />
              </Button>
            </ComposerPrimitive.Send>
          </ThreadPrimitive.If>

          <ThreadPrimitive.If running>
            <ComposerPrimitive.Cancel asChild>
              <Button
                aria-label={t("stop")}
                className="size-[2.125rem] rounded-full border border-muted-foreground/60"
                size="icon"
                type="button"
              >
                <SquareIcon className="size-3.5 fill-current" />
              </Button>
            </ComposerPrimitive.Cancel>
          </ThreadPrimitive.If>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
}
