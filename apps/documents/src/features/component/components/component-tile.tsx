import { useTranslation } from "react-i18next";

import type { DocsEntry } from "~/types/docs-catalogue";
import { Tile } from "~/components/tile/tile";
import { ROUTES } from "~/constants/routes";

/** From here a primitive's tile spans two columns — the rule is data, never hand-placed. */
const WIDE_TILE_EXPORTS = 10;
/** How many export names the preview line spells out before `+n`. */
const PREVIEW_EXPORTS = 3;

interface ComponentTileProps {
  entry: DocsEntry;
}

/**
 * One primitive in the list. The heading is the **slug**, not a prettified
 * name, because the slug is what a consumer types in the import path; the
 * line under it previews the first exports so a reader can tell `dialog`
 * from `alert-dialog` without opening either.
 */
export default function ComponentTile({ entry }: ComponentTileProps) {
  const { t } = useTranslation();

  const names = entry.exports.slice(0, PREVIEW_EXPORTS).join(", ");
  const rest = entry.exports.length - PREVIEW_EXPORTS;
  const preview =
    rest > 0
      ? `${names}, ${t("documents.components.exportPreviewMore", { count: rest })}`
      : names;

  return (
    <Tile
      to={ROUTES.componentBySlugPath(entry.slug)}
      slug={entry.slug}
      count={entry.exports.length}
      wide={entry.exports.length >= WIDE_TILE_EXPORTS}
    >
      <span className="text-muted-foreground mt-1 truncate font-mono text-xs">
        {preview}
      </span>
    </Tile>
  );
}
