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
import PeerDependencyList from "../components/peer-dependency-list";
import {
  FIRST_EXAMPLE_SNIPPET,
  NO_ROOT_ENTRY_SNIPPET,
  STYLESHEET_SNIPPET,
} from "../constants/snippets";

/**
 * The numbered panels below the cards, in reading order — the install step
 * lives in the hero. One list, so a panel's `01 / 04` is its position here
 * and adding a fifth is one entry rather than four edits.
 */
const PANELS = [
  {
    id: "peers",
    body: (
      <>
        <PeerDependencyList
          packageName={UI_PACKAGE_NAME}
          peers={PEER_DEPENDENCIES.ui}
        />
        <PeerDependencyList
          packageName={HOOK_PACKAGE_NAME}
          peers={PEER_DEPENDENCIES.hook}
        />
      </>
    ),
  },
  { id: "css", body: <StylesheetPanelBody /> },
  { id: "example", body: <CodeBlock code={FIRST_EXAMPLE_SNIPPET} /> },
  { id: "noRootEntry", body: <CodeBlock code={NO_ROOT_ENTRY_SNIPPET} /> },
] as const;

/** The one panel with copy of its own: the snippet, the warning, the note. */
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
        <AlertTitle>{t("documents.home.css.sourceWarningTitle")}</AlertTitle>
        <AlertDescription className="text-foreground/80">
          {t("documents.home.css.sourceWarning")}
        </AlertDescription>
      </Alert>
      <p className="text-muted-foreground text-sm">
        {t("documents.home.css.fragmentNote")}
      </p>
    </>
  );
}

export default function GettingStartedTemplate() {
  const { t } = useTranslation();

  useDocumentTitle(t("documents.home.title"));

  return (
    <>
      <Hero />
      <CatalogueCards />

      <div className="space-y-4.5 pb-10">
        {PANELS.map((panel, index) => (
          <DocsSection
            key={panel.id}
            index={index + 1}
            total={PANELS.length}
            title={t(`documents.home.${panel.id}.title`)}
            description={t(`documents.home.${panel.id}.description`)}
          >
            {panel.body}
          </DocsSection>
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
