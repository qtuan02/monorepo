import { Code, Component } from "lucide-react";
import { useNavigate } from "react-router";

import { Badge } from "@monorepo/ui";
import { cn } from "@monorepo/ui/libs/cn";

import type { SearchResult } from "~/utils/search-utils";

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  query: string;
}

export default function SearchResults({
  results,
  onSelect,
  query,
}: SearchResultsProps) {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    const path =
      result.type === "component"
        ? `/components/${result.id}`
        : `/hooks/${result.id}`;

    navigate(path);
    onSelect(result);
  };

  return (
    <div
      className="border-border bg-card absolute z-50 mt-2 w-full rounded-lg border shadow-lg"
      role="listbox"
      aria-label="Search results"
      data-testid="search-results"
    >
      <div className="max-h-96 overflow-y-auto p-2">
        {results.length === 0 ? (
          <div className="text-muted-foreground px-3 py-2 text-sm">
            No results found for &quot;{query}&quot;
          </div>
        ) : (
          results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              type="button"
              onClick={() => handleResultClick(result)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors",
                "hover:bg-muted focus:bg-muted focus:outline-none",
              )}
              role="option"
              data-testid="search-result"
            >
              <div className="mt-0.5 shrink-0">
                {result.type === "component" ? (
                  <Component className="text-muted-foreground size-4" />
                ) : (
                  <Code className="text-muted-foreground size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium">
                    {result.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {result.type === "component" ? "Component" : "Hook"}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                  <span>{result.category}</span>
                </div>
                {result.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    {result.description}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
