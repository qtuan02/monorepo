import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import { Input } from "@monorepo/ui/components/input";

interface FilterInputProps {
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * The filter box on both list pages. Presentational on purpose: it binds to the
 * caller's immediate value so typing never lags, and the caller is the one that
 * debounces the value it filters on (see patterns-debounce-search-input).
 */
export function FilterInput({ value, onValueChange }: FilterInputProps) {
  const { t } = useTranslation();

  return (
    <div className="relative max-w-sm">
      <Search
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        value={value}
        aria-label={t("documents.search.label")}
        placeholder={t("documents.search.placeholder")}
        className="pr-9 pl-9"
        onChange={(event) => onValueChange(event.target.value)}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("documents.search.clear")}
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => onValueChange("")}
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
