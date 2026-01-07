import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Terminal } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@monorepo/ui/components/tabs";

import Breadcrumb from "~/components/breadcrumb";
import ComponentCard from "~/components/component-card";
import { useComponentMetadata } from "~/hooks/use-component-metadata";

const INSTALL_COMMANDS = {
  npm: "npm install @fe-monorepo/ui",
  yarn: "yarn add @fe-monorepo/ui",
  pnpm: "pnpm add @fe-monorepo/ui",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-black dark:text-gray-200 dark:hover:bg-gray-900"
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

export default function AllComponentsPage() {
  const { components, isLoading } = useComponentMetadata();
  const [activeTab, setActiveTab] =
    useState<keyof typeof INSTALL_COMMANDS>("npm");

  useEffect(() => {
    document.title = "Components";
  }, []);

  // Sort all components alphabetically
  const sortedComponents = [...components].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <>
      <div className="px-4 pt-4 pb-8 md:px-12 md:pt-6">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[{ label: "Home", path: "/" }, { label: "Components" }]}
            className="mb-4"
          />
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              UI Introduction
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Browse all available UI components from the Shadcn UI collection
            </p>

            {/* Installation Card */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-black">
              {/* Header */}
              <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                <div>
                  <h3 className="text-base font-semibold text-black dark:text-white">
                    Installation
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Add the package to your project
                  </p>
                </div>
                <Tabs
                  value={activeTab}
                  onValueChange={(v) =>
                    setActiveTab(v as keyof typeof INSTALL_COMMANDS)
                  }
                >
                  <TabsList className="h-9 bg-gray-100 p-1 dark:bg-gray-800">
                    <TabsTrigger
                      value="npm"
                      className="h-7 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                    >
                      npm
                    </TabsTrigger>
                    <TabsTrigger
                      value="yarn"
                      className="h-7 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                    >
                      yarn
                    </TabsTrigger>
                    <TabsTrigger
                      value="pnpm"
                      className="h-7 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                    >
                      pnpm
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Code Block */}
              <div className="flex items-center gap-4 bg-black px-5 py-4 dark:bg-gray-950">
                <Terminal className="size-4 flex-shrink-0 text-gray-500" />
                <code className="flex-1 overflow-x-auto font-mono text-sm text-white">
                  {INSTALL_COMMANDS[activeTab]}
                </code>
                <CopyButton text={INSTALL_COMMANDS[activeTab]} />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-black">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  @fe-monorepo/ui
                </span>
                <a
                  href="https://www.npmjs.com/package/@fe-monorepo/ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-black transition-colors hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                >
                  View on npm
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-8">
              {/* Single shadcn section with all components */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">
                  Shadcn UI
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedComponents.map((component) => (
                    <ComponentCard key={component.id} component={component} />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
