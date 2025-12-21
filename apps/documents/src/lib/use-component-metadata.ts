import { useState, useEffect } from "react";

import type { ComponentMetadata } from "~/types/component-metadata";

/**
 * Hook to fetch component metadata
 * TODO: Replace with actual API call from Epic 3 when available
 */
export function useComponentMetadata() {
  const [components, setComponents] = useState<ComponentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: Will be replaced with actual API call from Epic 3
    // For now, return empty array
    setIsLoading(false);
    setComponents([]);
  }, []);

  return { components, isLoading };
}

