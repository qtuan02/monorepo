import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCopyToClipboard } from "@monorepo/hook/use-copy-to-clipboard";
import { Button } from "@monorepo/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";
import { cn } from "@monorepo/ui/utils/cn";

import { installCommands } from "~/constants/packages";

interface InstallCapsuleProps {
  /** The one package this capsule installs — `@fe-monorepo/ui` or `@fe-monorepo/hook`. */
  packageName: string;
  className?: string;
}

/**
 * The install command as one capsule of deep glass: the package-manager tabs
 * on the left, the command in the middle, a round copy button on the right.
 * Base UI marks the active tab with a bare `data-active` attribute and
 * `tabs.tsx` styles it, so the trigger only rounds itself — the Radix-era
 * `data-[state=active]:…` shape does not apply.
 *
 * Its own copy button rather than a `CodeBlock`: the block is a dark panel
 * around a `<pre>`, and this is a single line inside a pill.
 */
export default function InstallCapsule({
  packageName,
  className,
}: InstallCapsuleProps) {
  const { t } = useTranslation();
  const [copiedText, copy] = useCopyToClipboard();
  const commands = installCommands(packageName);

  return (
    <Tabs
      defaultValue={commands[0]?.id}
      className={cn(
        // The primitive stacks a horizontal Tabs (`data-horizontal:flex-col`),
        // which is what a capsule wants below `sm` — tabs over the command —
        // and not above it, where the four sit in one row. The same variant
        // is what overrides it, since a bare `flex-row` would lose to it.
        "glass glass-deep bg-(--glass-strong) flex w-full max-w-full items-center gap-2.5 rounded-[28px] p-2 sm:w-auto sm:gap-4 sm:rounded-full sm:data-horizontal:flex-row",
        className,
      )}
    >
      <TabsList className="bg-foreground/8 h-auto shrink-0 rounded-full p-[3px]">
        {commands.map((entry) => (
          <TabsTrigger
            key={entry.id}
            value={entry.id}
            className="data-active:bg-card h-7 rounded-full px-3 text-[12.5px]"
          >
            {entry.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {commands.map((entry) => {
        const isCopied = copiedText === entry.command;

        return (
          <TabsContent
            key={entry.id}
            value={entry.id}
            className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:gap-4"
          >
            {/* Scrolls inside the capsule on a narrow screen rather than
                widening the page: the command is two package names long. */}
            <code className="min-w-0 flex-1 overflow-x-auto px-1 py-1 font-mono text-[14.5px] whitespace-nowrap">
              {entry.command}
            </code>
            <Button
              type="button"
              size="icon"
              aria-label={
                isCopied
                  ? t("documents.code.copied")
                  : t("documents.home.hero.copyCommand")
              }
              className="bg-foreground text-background hover:bg-foreground/90 size-8.5 shrink-0 rounded-full"
              onClick={() => {
                void copy(entry.command);
              }}
            >
              {isCopied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
            <span role="status" className="sr-only">
              {isCopied ? t("documents.code.copied") : null}
            </span>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
