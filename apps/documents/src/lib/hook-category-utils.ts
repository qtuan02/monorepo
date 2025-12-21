import type { HookMetadata } from "~/types/hook-metadata";

export const HOOK_CATEGORIES = [
  "Client-side",
  "Utilities",
  "Uncategorized",
] as const;

export type HookCategory = (typeof HOOK_CATEGORIES)[number];

/**
 * Converts a hook category display name to a URL slug
 */
export function hookCategoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Converts a URL slug back to a hook category display name
 */
export function slugToHookCategory(slug: string): string {
  const categoryMap: Record<string, HookCategory> = {
    "client-side": "Client-side",
    utilities: "Utilities",
    uncategorized: "Uncategorized",
  };

  return categoryMap[slug] || "Uncategorized";
}

/**
 * Validates if a slug is a valid hook category
 */
export function isValidHookCategorySlug(slug: string): boolean {
  const validSlugs = ["client-side", "utilities", "uncategorized"];
  return validSlugs.includes(slug);
}

/**
 * Filters hooks by category
 */
export function filterHooksByCategory(
  hooks: HookMetadata[],
  category: string,
): HookMetadata[] {
  const normalizedCategory = slugToHookCategory(category);
  return hooks.filter((hook) => hook.category === normalizedCategory);
}

