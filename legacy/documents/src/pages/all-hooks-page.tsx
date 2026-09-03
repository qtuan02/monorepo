import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Terminal } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@monorepo/ui/components/tabs";

import Breadcrumb from "~/components/breadcrumb";
import HookCard from "~/components/hook-card";
import { useHookMetadata } from "~/hooks/use-hook-metadata";

const INSTALL_COMMANDS = {
  npm: "npm install @fe-monorepo/hook",
  yarn: "yarn add @fe-monorepo/hook",
  pnpm: "pnpm add @fe-monorepo/hook",
};

const installTabTriggerClass =
  "h-7 rounded-md px-3 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border-border bg-background text-foreground hover:bg-muted flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm transition-all"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="size-3.5" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default function AllHooksPage() {
  const { hooks } = useHookMetadata();
  const [activeTab, setActiveTab] =
    useState<keyof typeof INSTALL_COMMANDS>("npm");

  useEffect(() => {
    document.title = "Hooks";
  }, []);

  const sortedHooks = [...hooks].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="px-4 py-4 md:px-12 md:py-6">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[{ label: "Home", path: "/" }, { label: "Hooks" }]}
            className="mb-4"
          />
          <div className="mb-8">
            <h1 className="text-foreground text-3xl font-bold">
              Hook Introduction
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse all available custom React hooks
            </p>

            <div className="border-border bg-card mt-6 rounded-lg border shadow-sm">
              <div className="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-foreground text-base font-semibold">
                    Installation
                  </h3>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    Add the package to your project
                  </p>
                </div>
                <Tabs
                  value={activeTab}
                  onValueChange={(v) =>
                    setActiveTab(v as keyof typeof INSTALL_COMMANDS)
                  }
                >
                  <TabsList className="bg-muted h-9 p-1">
                    <TabsTrigger value="npm" className={installTabTriggerClass}>
                      npm
                    </TabsTrigger>
                    <TabsTrigger
                      value="yarn"
                      className={installTabTriggerClass}
                    >
                      yarn
                    </TabsTrigger>
                    <TabsTrigger
                      value="pnpm"
                      className={installTabTriggerClass}
                    >
                      pnpm
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-4 bg-black px-5 py-4">
                <Terminal className="text-muted-foreground size-4 shrink-0" />
                <code className="flex-1 overflow-x-auto font-mono text-sm text-white">
                  {INSTALL_COMMANDS[activeTab]}
                </code>
                <CopyButton text={INSTALL_COMMANDS[activeTab]} />
              </div>

              <div className="border-border bg-muted/50 flex items-center justify-between border-t px-5 py-3">
                <span className="text-muted-foreground text-sm">
                  @fe-monorepo/hook
                </span>
                <a
                  href="https://www.npmjs.com/package/@fe-monorepo/hook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-muted-foreground flex items-center gap-1.5 text-sm font-medium transition-colors"
                >
                  View on npm
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-foreground mb-4 text-2xl font-semibold">
                Custom Hooks
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedHooks.map((hook) => (
                  <HookCard key={hook.id} hook={hook} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
