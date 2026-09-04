"use client";

import { ComposerPrimitive } from "@assistant-ui/react";
import { useTranslations } from "next-intl";

import { Button } from "@monorepo/ui/components/button";

/** What a user message turns into while it is being edited. */
export default function EditComposer() {
  const t = useTranslations("assistantAi.chat");

  return (
    <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-col gap-4 px-2 first:mt-4">
      <ComposerPrimitive.Root className="ml-auto flex w-full max-w-7/8 flex-col rounded-xl bg-muted">
        <ComposerPrimitive.Input
          autoFocus
          aria-label={t("inputLabel")}
          className="flex min-h-[3.75rem] w-full resize-none bg-transparent p-4 text-foreground outline-none"
        />

        <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button size="sm" variant="outline">
              {t("cancelEdit")}
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm">{t("saveEdit")}</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
}
