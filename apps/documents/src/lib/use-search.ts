import { useMemo } from "react";

import type { SearchResult } from "~/lib/search-utils";
import {
  searchComponentsAndHooks,
  limitSearchResults,
} from "~/lib/search-utils";
import { useComponentMetadata } from "~/lib/use-component-metadata";
import { useHookMetadata } from "~/lib/use-hook-metadata";

/**
 * Hook that provides search functionality across components and hooks
 */
export function useSearch() {
  const { components } = useComponentMetadata();
  const { hooks } = useHookMetadata();

  const performSearch = useMemo(
    () => (query: string): SearchResult[] => {
      const results = searchComponentsAndHooks(query, components, hooks);
      return limitSearchResults(results, 20);
    },
    [components, hooks],
  );

  return {
    search: performSearch,
    isLoading: false, // Could be enhanced when metadata loading is async
  };
}

