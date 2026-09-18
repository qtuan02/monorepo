import { useTranslation } from "react-i18next";

import type { DocsEntry } from "~/types/docs-catalogue";
import { Tile } from "~/components/tile/tile";
import { ROUTES } from "~/constants/routes";

interface HookTileProps {
  entry: DocsEntry;
}

/**
 * One hook in the list. Unlike a primitive it carries a sentence, because there
 * are only five of them and the published README already writes one for each —
 * the copy lives in the shared i18n catalogue, keyed by slug. Never wide and
 * no count badge: a hook has one export, so the grid stays even and a "1" in
 * every corner would say nothing.
 */
export default function HookTile({ entry }: HookTileProps) {
  const { t } = useTranslation();

  return (
    <Tile to={ROUTES.hookBySlugPath(entry.slug)} slug={entry.slug}>
      <span className="text-muted-foreground mt-1 text-sm">
        {t(`documents.hooks.items.${entry.slug}.description`)}
      </span>
    </Tile>
  );
}
