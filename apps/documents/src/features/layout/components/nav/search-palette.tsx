import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@monorepo/ui/components/command";

import type { DocsEntry } from "~/types/docs-catalogue";
import { Swatch } from "~/components/swatch/swatch";
import { componentCatalogue, hookCatalogue } from "~/constants/docs-catalogue";
import { ROUTES } from "~/constants/routes";

interface CatalogueGroupProps {
  heading: string;
  items: readonly DocsEntry[];
  /** `ROUTES.componentBySlugPath` or its hook twin — never an interpolated path. */
  buildPath: (slug: string) => string;
  onPick: (path: string) => void;
}

/**
 * One group of the palette. Module-scope, not inside `SearchPalette`: a
 * component declared in another's body is a new reference every render, and
 * React would remount every row (see react-no-inline-components).
 */
function CatalogueGroup({
  heading,
  items,
  buildPath,
  onPick,
}: CatalogueGroupProps) {
  return (
    <CommandGroup heading={heading}>
      {items.map((entry) => (
        <CommandItem
          key={entry.slug}
          // cmdk filters and ranks on `value`, so the slug is what a query
          // matches — `dia` ranks `dialog` above `alert-dialog`.
          value={entry.slug}
          onSelect={() => onPick(buildPath(entry.slug))}
        >
          <Swatch slug={entry.slug} size="sm" />
          <span className="font-mono font-semibold whitespace-nowrap">
            {entry.slug}
          </span>
          <span className="text-muted-foreground ml-auto truncate font-mono text-xs max-sm:hidden">
            {entry.subpath}
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The way into the 68 entry pages now that there is no sidebar: a command
 * palette over both catalogues, grouped Component / Hook, each row a swatch,
 * the slug and its subpath. Picking a row navigates and closes.
 */
export default function SearchPalette({
  open,
  onOpenChange,
}: SearchPaletteProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const pick = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("documents.nav.search.title")}
      description={t("documents.nav.search.description")}
      // Spelled as utilities rather than the `glass` utility on purpose: the
      // dialog primitive carries its own `bg-popover`, `border` and
      // `shadow-lg`, and only a Tailwind utility of the same family replaces
      // those through `cn`'s merge — a custom utility would sit beside them
      // and lose.
      // `max-sm:top-4` beats the primitive's `top-1/3` under Tailwind's own
      // variant ordering — see brief §3.4 — so the palette stays clear of the
      // virtual keyboard instead of opening a third of the way down the screen.
      className="border-(--glass-edge) bg-(--glass) shadow-[var(--sh-1),var(--sh-2),var(--sh-3),var(--sh-4)] backdrop-blur-[18px] backdrop-saturate-150 max-sm:top-4"
    >
      <Command className="bg-transparent">
        <CommandInput placeholder={t("documents.nav.search.placeholder")} />
        <CommandList className="max-sm:max-h-[60dvh]">
          <CommandEmpty>{t("documents.nav.search.empty")}</CommandEmpty>
          <CatalogueGroup
            heading={t("documents.nav.search.groupComponents")}
            items={componentCatalogue.items}
            buildPath={ROUTES.componentBySlugPath}
            onPick={pick}
          />
          <CatalogueGroup
            heading={t("documents.nav.search.groupHooks")}
            items={hookCatalogue.items}
            buildPath={ROUTES.hookBySlugPath}
            onPick={pick}
          />
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
