import { useEffect, useMemo, useState } from "react";

import type { ComponentMetadata } from "~/types/component-metadata";
// Import generated data (created by scripts/generate-metadata.ts)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Generated at build time
import componentsData from "~/generated/components.json";

/**
 * Hook to fetch component metadata
 * Uses auto-generated data from build-time script
 */
export function useComponentMetadata() {
  const [components, setComponents] = useState<ComponentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Use generated data
      const data = componentsData?.components || [];
      setComponents(data as ComponentMetadata[]);
    } catch (error) {
      console.error("Failed to load component metadata:", error);
      setComponents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { components, isLoading };
}

/**
 * Hook to fetch a single component by ID
 * @param id - Component ID to fetch
 */
export function useComponentById(id: string) {
  const { components, isLoading } = useComponentMetadata();

  const component = useMemo(() => {
    return components.find((c) => c.id === id) || null;
  }, [components, id]);

  return { component, isLoading };
}
