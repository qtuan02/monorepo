import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@monorepo/ui/components/empty";

interface FilterEmptyProps {
  query: string;
  onClear: () => void;
}

/**
 * What either list shows when the filter matches nothing: the query it
 * missed on, a hint, and the way back — clearing the filter here rather
 * than in the input, which the reader has just scrolled past.
 */
export function FilterEmpty({ query, onClear }: FilterEmptyProps) {
  const { t } = useTranslation();

  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>{t("documents.search.empty", { query })}</EmptyTitle>
        <EmptyDescription>{t("documents.search.emptyHint")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" onClick={onClear}>
          {t("documents.search.clear")}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
