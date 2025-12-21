import type { ComponentMetadata } from "~/types/component-metadata";

export const CATEGORIES = [
  "Form",
  "Layout",
  "Feedback",
  "Data Display",
  "Navigation",
  "Uncategorized",
] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * Converts a category display name to a URL slug
 */
export function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Converts a URL slug back to a category display name
 */
export function slugToCategory(slug: string): string {
  const categoryMap: Record<string, Category> = {
    form: "Form",
    layout: "Layout",
    feedback: "Feedback",
    "data-display": "Data Display",
    navigation: "Navigation",
    uncategorized: "Uncategorized",
  };

  return categoryMap[slug] || "Uncategorized";
}

/**
 * Validates if a slug is a valid category
 */
export function isValidCategorySlug(slug: string): boolean {
  const validSlugs = [
    "form",
    "layout",
    "feedback",
    "data-display",
    "navigation",
    "uncategorized",
  ];
  return validSlugs.includes(slug);
}

/**
 * Filters components by category
 */
export function filterComponentsByCategory(
  components: ComponentMetadata[],
  category: string,
): ComponentMetadata[] {
  const normalizedCategory = slugToCategory(category);
  return components.filter((component) => component.category === normalizedCategory);
}

