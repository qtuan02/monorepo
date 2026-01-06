import type { ComponentMetadata } from "~/types/component-metadata";
import type { HookMetadata } from "~/types/hook-metadata";

export type PackageFilter = "all" | "ui" | "hook";

export const PACKAGE_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ui", label: "UI Components" },
  { value: "hook", label: "Hooks" },
] as const;

/**
 * Filters components by package type
 */
export function filterComponentsByPackage(
  components: ComponentMetadata[],
  packageFilter: PackageFilter,
): ComponentMetadata[] {
  if (packageFilter === "all" || packageFilter === "ui") {
    return components;
  }
  return [];
}

/**
 * Filters hooks by package type
 */
export function filterHooksByPackage(
  hooks: HookMetadata[],
  packageFilter: PackageFilter,
): HookMetadata[] {
  if (packageFilter === "all" || packageFilter === "hook") {
    return hooks;
  }
  return [];
}

/**
 * Validates package filter value from URL
 */
export function isValidPackageFilter(value: string | null): value is PackageFilter {
  return value === "all" || value === "ui" || value === "hook";
}

/**
 * Gets package filter from URL search params with default
 */
export function getPackageFilterFromUrl(
  searchParams: URLSearchParams,
): PackageFilter {
  const filter = searchParams.get("package");
  return isValidPackageFilter(filter) ? filter : "all";
}
