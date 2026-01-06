import { useEffect, useMemo, useState } from "react";

import type { HookMetadata } from "~/types/hook-metadata";
// Import generated data (created by scripts/generate-metadata.ts)
 
// @ts-ignore - Generated at build time
import hooksData from "~/constants/hooks.json";

/**
 * Hook to fetch hook metadata
 * Uses auto-generated data from build-time script
 */
export function useHookMetadata() {
  const [hooks, setHooks] = useState<HookMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Use generated data
      const data = hooksData?.hooks || [];
      setHooks(data as HookMetadata[]);
    } catch (error) {
      console.error("Failed to load hook metadata:", error);
      setHooks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { hooks, isLoading };
}

/**
 * Hook to fetch a single hook by ID
 * @param id - Hook ID to fetch
 */
export function useHookById(id: string) {
  const { hooks, isLoading } = useHookMetadata();

  const hook = useMemo(() => {
    return hooks.find((h) => h.id === id) || null;
  }, [hooks, id]);

  return { hook, isLoading };
}
