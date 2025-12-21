import { useState, useEffect } from "react";

import type { HookMetadata } from "~/types/hook-metadata";

/**
 * Hook to fetch hook metadata
 * TODO: Replace with actual API call from Epic 3 when available
 */
export function useHookMetadata() {
  const [hooks, setHooks] = useState<HookMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: Will be replaced with actual API call from Epic 3
    // For now, return empty array
    setIsLoading(false);
    setHooks([]);
  }, []);

  return { hooks, isLoading };
}

