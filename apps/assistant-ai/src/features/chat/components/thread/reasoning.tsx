"use client";

import type {
  ReasoningGroupComponent,
  ReasoningMessagePartComponent,
} from "@assistant-ui/react";
import { memo } from "react";
import { BrainIcon, ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@monorepo/ui/components/collapsible";

import { MarkdownText } from "./markdown-text";

/** One reasoning part. Consecutive ones are wrapped by `ReasoningGroup` below. */
const ReasoningImpl: ReasoningMessagePartComponent = () => <MarkdownText />;

/**
 * The collapsible the model's thinking is folded into, closed by default.
 *
 * Deliberately plainer than the app this replaced, which drove a shimmer, a
 * gradient fade and a scroll lock off Radix's `data-[state=open]` value
 * attribute plus two keyframes of its own. `@monorepo/ui` is on Base UI, which
 * states the same thing as bare `data-open`/`data-closed`
 * (`.agents/rules/architecture-ui-primitives.md`), and neither keyframe exists
 * in `@monorepo/tailwind-config` — porting the choreography would have meant
 * adding app-local animation tokens for decoration. The behaviour a reader
 * depends on, seeing the reasoning and being able to fold it away, is unchanged.
 */
const ReasoningGroupImpl: ReasoningGroupComponent = ({ children }) => {
  const t = useTranslations("assistantAi.chat");

  return (
    <Collapsible className="mb-4 w-full">
      <CollapsibleTrigger className="group/trigger -mb-2 flex max-w-[75%] items-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <BrainIcon className="size-4 shrink-0" />
        <span className="leading-none">{t("reasoning")}</span>
        <ChevronDownIcon className="mt-0.5 size-4 shrink-0 -rotate-90 transition-transform duration-200 ease-out group-aria-expanded/trigger:rotate-0" />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 pt-4 pl-6 text-sm leading-relaxed text-muted-foreground [&_p]:-mb-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const Reasoning = memo(ReasoningImpl);
export const ReasoningGroup = memo(ReasoningGroupImpl);
