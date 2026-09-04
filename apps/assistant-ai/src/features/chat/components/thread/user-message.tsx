"use client";

import { ActionBarPrimitive, MessagePrimitive } from "@assistant-ui/react";
import { PencilIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { BranchPicker } from "./branch-picker";
import { TooltipIconButton } from "./tooltip-icon-button";

/** One visitor turn, right-aligned, with an edit action that opens the edit composer. */
export function UserMessage() {
  const t = useTranslations("assistantAi.chat");

  return (
    <MessagePrimitive.Root asChild>
      <div
        className="mx-auto grid w-full max-w-(--thread-max-width) auto-rows-auto grid-cols-[minmax(4.5rem,1fr)_auto] gap-y-2 px-2 py-4 first:mt-3 last:mb-5 animate-in fade-in slide-in-from-bottom-1 duration-150 ease-out [&:where(>*)]:col-start-2"
        data-role="user"
      >
        <div className="relative col-start-2 min-w-0">
          <div className="rounded-3xl bg-muted px-5 py-2.5 break-words text-foreground">
            <MessagePrimitive.Parts />
          </div>
          <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
            <ActionBarPrimitive.Root
              hideWhenRunning
              autohide="not-last"
              className="flex flex-col items-end"
            >
              <ActionBarPrimitive.Edit asChild>
                <TooltipIconButton className="p-4" tooltip={t("edit")}>
                  <PencilIcon />
                </TooltipIconButton>
              </ActionBarPrimitive.Edit>
            </ActionBarPrimitive.Root>
          </div>
        </div>

        <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
      </div>
    </MessagePrimitive.Root>
  );
}
