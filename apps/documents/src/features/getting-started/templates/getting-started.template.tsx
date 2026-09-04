import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";
import { cn } from "@monorepo/ui/utils/cn";

import { CodeBlock } from "~/components/code/code-block";
import { DocsSection } from "~/components/page/docs-section";
import { PageHeader } from "~/components/page/page-header";
import {
  HOOK_PACKAGE_NAME,
  INSTALL_COMMANDS,
  PEER_DEPENDENCIES,
  UI_PACKAGE_NAME,
} from "~/constants/packages";
import { ROUTES } from "~/constants/routes";
import { useDocumentTitle } from "~/hooks/use-document-title";
import PeerDependencyTable from "../components/peer-dependency-table";

// The three snippets a consumer copies verbatim. They are content rather than
// configuration, so they sit beside the only screen that renders them — and
// they are quoted from packages/ui-public/README.md, which is the surface the
// publish ticket settled. Change them there first.
const STYLESHEET_SNIPPET = `/* src/index.css */
@import "tailwindcss";
@import "${UI_PACKAGE_NAME}/globals.css";

@source "../node_modules/${UI_PACKAGE_NAME}/dist";`;

const FIRST_EXAMPLE_SNIPPET = `import { Button } from "${UI_PACKAGE_NAME}/components/button";
import { cn } from "${UI_PACKAGE_NAME}/utils/cn";

export function SaveRow({ busy }: { busy: boolean }) {
  return <Button className={cn(busy && "opacity-50")}>Save</Button>;
}`;

const NO_ROOT_ENTRY_SNIPPET = `import { Button } from "${UI_PACKAGE_NAME}";           // ✗
import { Button } from "${UI_PACKAGE_NAME}/components/button"; // ✓`;

export default function GettingStartedTemplate() {
  const { t } = useTranslation();

  useDocumentTitle(t("documents.home.title"));

  return (
    <>
      <PageHeader
        title={t("documents.home.title")}
        description={t("documents.home.description")}
      />

      <DocsSection
        title={t("documents.home.install.title")}
        description={t("documents.home.install.description")}
      >
        {/* Base UI marks the active tab with a bare `data-active` attribute and
            `tabs.tsx` already styles it, so no state className is passed here —
            the Radix-era `data-[state=active]:…` shape does not apply. */}
        <Tabs defaultValue={INSTALL_COMMANDS[0]?.id}>
          <TabsList>
            {INSTALL_COMMANDS.map((entry) => (
              <TabsTrigger key={entry.id} value={entry.id}>
                {entry.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {INSTALL_COMMANDS.map((entry) => (
            <TabsContent key={entry.id} value={entry.id} className="mt-3">
              <CodeBlock code={entry.command} />
            </TabsContent>
          ))}
        </Tabs>
        <p className="text-muted-foreground text-sm">
          {t("documents.home.install.note")}
        </p>
      </DocsSection>

      <DocsSection
        title={t("documents.home.peers.title")}
        description={t("documents.home.peers.description")}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <PeerDependencyTable
            packageName={UI_PACKAGE_NAME}
            peers={PEER_DEPENDENCIES.ui}
          />
          <PeerDependencyTable
            packageName={HOOK_PACKAGE_NAME}
            peers={PEER_DEPENDENCIES.hook}
          />
        </div>
      </DocsSection>

      <DocsSection
        title={t("documents.home.css.title")}
        description={t("documents.home.css.description")}
      >
        <CodeBlock code={STYLESHEET_SNIPPET} />
        <p className="border-destructive/40 bg-destructive/5 text-foreground rounded-lg border-l-4 p-3 text-sm">
          {t("documents.home.css.sourceWarning")}
        </p>
        <p className="text-muted-foreground text-sm">
          {t("documents.home.css.fragmentNote")}
        </p>
      </DocsSection>

      <DocsSection
        title={t("documents.home.example.title")}
        description={t("documents.home.example.description")}
      >
        <CodeBlock code={FIRST_EXAMPLE_SNIPPET} />
      </DocsSection>

      <DocsSection
        title={t("documents.home.noRootEntry.title")}
        description={t("documents.home.noRootEntry.description")}
      >
        <CodeBlock code={NO_ROOT_ENTRY_SNIPPET} />
      </DocsSection>

      <DocsSection title={t("documents.home.next.title")}>
        <div className="flex flex-wrap gap-3">
          {/* Styled links, never `<Button render={<Link/>}>`: these navigate,
              and Base UI's Button assumes a native <button>. */}
          <Link to={ROUTES.COMPONENTS} className={cn(buttonVariants())}>
            {t("documents.home.next.components")}
          </Link>
          <Link
            to={ROUTES.HOOKS}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {t("documents.home.next.hooks")}
          </Link>
        </div>
      </DocsSection>
    </>
  );
}
