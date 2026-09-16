import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { cn } from "@monorepo/ui/utils/cn";

import { componentCatalogue, hookCatalogue } from "~/constants/docs-catalogue";
import { ROUTES } from "~/constants/routes";
import { env } from "~/env";

/**
 * A floating card's shell: deep glass, the small uppercase heading pinned to
 * the top-left, the body at the bottom, and a blurred swatch bleeding off the
 * bottom-right corner. The whole card is the link — a `<Link>` or an `<a>` —
 * so the two link kinds share this by className rather than by wrapping.
 */
const cardClassName =
  "glass glass-deep group relative flex min-h-42 flex-col justify-end overflow-hidden rounded-(--radius) p-5.5 outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const cardHeadingClassName =
  "text-muted-foreground absolute top-5 left-5.5 text-[12.5px] font-semibold tracking-[0.04em] uppercase";

const cardSwatchClassName =
  "pointer-events-none absolute -right-7.5 -bottom-7.5 size-37.5 rounded-[40px] opacity-90 blur-[2px]";

interface CountCardProps {
  to: string;
  heading: string;
  count: number;
  label: string;
  swatchClassName: string;
}

/** `63 primitive Base UI` — the number leads, the catalogue's label follows. */
function CountCard({
  to,
  heading,
  count,
  label,
  swatchClassName,
}: CountCardProps) {
  return (
    <Link to={to} className={cardClassName}>
      {/* The literal spaces are for the accessible name: the spans are inline,
          so without them a screen reader hears "Component63primitive". A
          whitespace-only text node is not a flex item, so layout is unmoved. */}
      <span className={cardHeadingClassName}>{heading}</span>{" "}
      <span
        aria-hidden="true"
        className="bg-card text-foreground absolute top-4 right-4 grid size-8.5 place-items-center rounded-full shadow-(--sh-2)"
      >
        <ArrowUpRight className="size-4" />
      </span>
      <span className="relative">
        <span className="font-heading text-[3.5rem] leading-none font-extrabold tracking-[-0.05em] tabular-nums">
          {count}
        </span>{" "}
        <span className="text-muted-foreground ml-2 text-[15px] font-medium">
          {label}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(cardSwatchClassName, swatchClassName)}
      />
    </Link>
  );
}

/**
 * The three cards under the hero (brief §2c *Landing*): the two catalogues,
 * each counted from the generated JSON rather than a literal — run `ui-add`
 * and the next build says 64 — and a solid indigo card that is the Storybook
 * call to action. `1.2fr 1fr 1fr` from `md`, stacked below.
 */
export default function CatalogueCards() {
  const { t } = useTranslation();
  const componentCount = componentCatalogue.items.length;
  const hookCount = hookCatalogue.items.length;

  return (
    <div className="grid gap-4 pb-10 md:grid-cols-[1.2fr_1fr_1fr]">
      <CountCard
        to={ROUTES.COMPONENTS}
        heading={t("documents.nav.components")}
        count={componentCount}
        label={t("documents.home.cards.components", { count: componentCount })}
        swatchClassName="bg-[conic-gradient(from_0deg,var(--aurora-indigo),var(--aurora-cyan),var(--aurora-indigo))]"
      />
      <CountCard
        to={ROUTES.HOOKS}
        heading={t("documents.nav.hooks")}
        count={hookCount}
        label={t("documents.home.cards.hooks", { count: hookCount })}
        swatchClassName="bg-[linear-gradient(135deg,var(--aurora-pink),var(--aurora-amber))]"
      />

      {/* The one solid card: the primary fill to violet, the primary's ink,
          and the swatch at half strength so it tints rather than glows. A
          plain <a> styled by className, never `<Button render={<a/>}>` (see
          architecture-ui-primitives). */}
      <a
        href={env.PUBLIC_DOCUMENTS_STORYBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          cardClassName,
          "text-primary-foreground border-primary-foreground/35 bg-[linear-gradient(135deg,var(--primary),var(--aurora-violet))]",
        )}
      >
        <span className={cn(cardHeadingClassName, "text-primary-foreground")}>
          {t("documents.home.cards.storybook")}
        </span>{" "}
        <span className="bg-card text-foreground relative inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-(--sh-2)">
          {t("documents.home.cards.storybookCta")}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </span>
        <span
          aria-hidden="true"
          className={cn(
            cardSwatchClassName,
            "bg-[conic-gradient(from_90deg,var(--aurora-cyan),var(--aurora-pink),var(--aurora-amber),var(--aurora-cyan))] opacity-60",
          )}
        />
      </a>
    </div>
  );
}
