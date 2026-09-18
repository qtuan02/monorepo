import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@monorepo/ui/components/alert";
import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { CodeBlock } from "~/components/code/code-block";
import { DocsSection } from "~/components/page/docs-section";
import {
  HOOK_PACKAGE_NAME,
  PEER_DEPENDENCIES,
  UI_PACKAGE_NAME,
} from "~/constants/packages";
import { ROUTES } from "~/constants/routes";
import { useDocumentTitle } from "~/hooks/use-document-title";
import CatalogueCards from "../components/catalogue-cards";
import Hero from "../components/hero";
import InstallCapsule from "../components/install-capsule";
import PeerDependencyList from "../components/peer-dependency-list";
import {
  FIRST_EXAMPLE_SNIPPET,
  hookExampleSnippet,
  NO_ROOT_ENTRY_SNIPPET,
  STYLESHEET_SNIPPET,
  themeSnippet,
} from "../constants/snippets";

interface Panel {
  /** The `documents.home.<id>` key its title and description live under. */
  id: string;
  body: ReactNode;
}

interface Guide {
  packageName: string;
  /** The `documents.home.guides.<id>` key of its lead sentence. */
  id: "ui" | "hook";
  panels: readonly Panel[];
}

/**
 * Two guides, one per published package, each its own numbered stack so a
 * reader who came for the hooks never wades through Tailwind. A panel's
 * `01 / 06` is its position in its guide, and adding one is one entry.
 * Install opens each guide — the capsule moved here from the hero for the
 * same reason the guides are apart: one package, one command.
 */
const GUIDES: readonly Guide[] = [
  {
    packageName: UI_PACKAGE_NAME,
    id: "ui",
    panels: [
      {
        id: "install",
        body: <InstallCapsule packageName={UI_PACKAGE_NAME} />,
      },
      {
        id: "peers",
        body: (
          <PeerDependencyList
            packageName={UI_PACKAGE_NAME}
            peers={PEER_DEPENDENCIES.ui}
          />
        ),
      },
      { id: "css", body: <StylesheetPanelBody /> },
      { id: "theme", body: <ThemePanelBody /> },
      { id: "example", body: <CodeBlock code={FIRST_EXAMPLE_SNIPPET} /> },
      { id: "noRootEntry", body: <CodeBlock code={NO_ROOT_ENTRY_SNIPPET} /> },
    ],
  },
  {
    packageName: HOOK_PACKAGE_NAME,
    id: "hook",
    panels: [
      {
        id: "install",
        body: <InstallCapsule packageName={HOOK_PACKAGE_NAME} />,
      },
      {
        id: "peers",
        body: (
          <PeerDependencyList
            packageName={HOOK_PACKAGE_NAME}
            peers={PEER_DEPENDENCIES.hook}
          />
        ),
      },
      { id: "hook", body: <HookPanelBody /> },
    ],
  },
];

/** The stylesheet panel: the snippet, the warning, the note. */
function StylesheetPanelBody() {
  const { t } = useTranslation();

  return (
    <>
      <CodeBlock code={STYLESHEET_SNIPPET} />
      {/* Warning, not destructive: nothing broke yet — the line is the one a
          reader skips and only notices a build later. The primitive has no
          warning variant, so the three token utilities are set here. */}
      <Alert className="border-warning/50 bg-warning/20 text-foreground rounded-[14px]">
        <TriangleAlert />
        <AlertTitle>{t("documents.home.css.importWarningTitle")}</AlertTitle>
        <AlertDescription className="text-foreground/80">
          {t("documents.home.css.importWarning")}
        </AlertDescription>
      </Alert>
      <p className="text-muted-foreground text-sm">
        {t("documents.home.css.fragmentNote")}
      </p>
    </>
  );
}

/** The theme panel: the override snippet, then the one rule that makes it win. */
function ThemePanelBody() {
  const { t } = useTranslation();

  return (
    <>
      <CodeBlock
        code={themeSnippet(t("documents.home.theme.snippetComment"))}
      />
      <p className="text-muted-foreground text-sm">
        {t("documents.home.theme.layerNote")}
      </p>
    </>
  );
}

/** The hook guide's one snippet, its comment in the reader's language. */
function HookPanelBody() {
  const { t } = useTranslation();

  return (
    <CodeBlock
      code={hookExampleSnippet(t("documents.home.hook.snippetComment"))}
    />
  );
}

export default function GettingStartedTemplate() {
  const { t } = useTranslation();

  useDocumentTitle(t("documents.home.title"));

  return (
    <>
      <Hero />
      <CatalogueCards />

      <div className="space-y-12 pb-10">
        {GUIDES.map((guide) => (
          <section
            key={guide.id}
            aria-labelledby={`guide-${guide.id}`}
            className="space-y-4.5"
          >
            <div className="px-1 pt-2">
              <h2
                id={`guide-${guide.id}`}
                className="font-heading text-3xl font-extrabold tracking-[-0.04em]"
              >
                <span className="prism-text font-mono">
                  {guide.packageName}
                </span>
              </h2>
              <p className="text-muted-foreground mt-2 max-w-prose text-base">
                {t(`documents.home.guides.${guide.id}`)}
              </p>
            </div>

            {guide.panels.map((panel, index) => (
              <DocsSection
                key={panel.id}
                index={index + 1}
                total={guide.panels.length}
                title={t(`documents.home.${panel.id}.title`)}
                description={t(`documents.home.${panel.id}.description`)}
              >
                {panel.body}
              </DocsSection>
            ))}
          </section>
        ))}

        {/* Styled links, never `<Button render={<Link/>}>`: these navigate,
            and Base UI's Button assumes a native <button>. */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link
            to={ROUTES.COMPONENTS}
            className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
          >
            {t("documents.home.next.components")}
          </Link>
          <Link
            to={ROUTES.HOOKS}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "bg-card rounded-full",
            )}
          >
            {t("documents.home.next.hooks")}
          </Link>
        </div>
      </div>
    </>
  );
}
