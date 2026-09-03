import { useMemo } from "react";

import type { HookMetadata } from "~/types/hook-metadata";
import hooksData from "~/constants/hooks.json";

const HOOKS = (hooksData as { hooks: HookMetadata[] }).hooks;

export function useHookMetadata() {
  return useMemo(() => ({ hooks: HOOKS, isLoading: false }), []);
}

export function useHookById(id: string) {
  const { hooks, isLoading } = useHookMetadata();

  const hook = useMemo(() => {
    return hooks.find((h) => h.id === id) || null;
  }, [hooks, id]);

  return { hook, isLoading };
}
