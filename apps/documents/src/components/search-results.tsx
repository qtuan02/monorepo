import { useNavigate } from "react-router";
import { Badge } from "@monorepo/ui";
import { cn } from "@monorepo/ui/libs/cn";
import { Component, Code } from "lucide-react";

import type { SearchResult } from "~/lib/search-utils";
import { categoryToSlug } from "~/lib/category-utils";
import { hookCategoryToSlug } from "~/lib/hook-category-utils";

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
    let path: string;
    
    if (result.type === "component") {
      const categorySlug = categoryToSlug(result.category);
      path = `/components/${categorySlug}/${result.id}`;
    } else {
      const categorySlug = hookCategoryToSlug(result.category);
      path = `/hooks/${categorySlug}/${result.id}`;
    }

    navigate(path);
    onSelect(result);
  };

  return (
    <div
      className="absolute z-50 mt-2 w-full rounded-lg border bg-white shadow-lg dark:bg-gray-900"
      role="listbox"
      aria-label="Search results"
      data-testid="search-results"
    >
      <div className="max-h-96 overflow-y-auto p-2">
        {results.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            No results found for "{query}"
          </div>
        ) : (
          results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              type="button"
              onClick={() => handleResultClick(result)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800",
              )}
              role="option"
              data-testid="search-result"
            >
              <div className="mt-0.5 shrink-0">
                {result.type === "component" ? (
                  <Component className="size-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Code className="size-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {result.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {result.type === "component" ? "Component" : "Hook"}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>{result.category}</span>
                </div>
                {result.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
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

