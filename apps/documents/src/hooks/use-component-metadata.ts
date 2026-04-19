import { useMemo } from "react";

import type { ComponentMetadata } from "~/types/component-metadata";
import componentsData from "~/constants/components.json";

const COMPONENTS = (componentsData as { components: ComponentMetadata[] })
  .components;

export function useComponentMetadata() {
  return useMemo(() => ({ components: COMPONENTS, isLoading: false }), []);
}

export function useComponentById(id: string) {
  const { components, isLoading } = useComponentMetadata();

  const component = useMemo(() => {
    return components.find((c) => c.id === id) || null;
  }, [components, id]);

  return { component, isLoading };
}
