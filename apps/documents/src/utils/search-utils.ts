import type { ComponentMetadata } from "~/types/component-metadata";
import type { HookMetadata } from "~/types/hook-metadata";

export interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  category: string;
  type: "component" | "hook";
  package: "ui" | "hook";
}

/**
 * Searches across components and hooks by name (case-insensitive)
 * Returns unified results with relevance scoring
 */
export function searchComponentsAndHooks(
  query: string,
  components: ComponentMetadata[],
  hooks: HookMetadata[],
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Search components
  for (const component of components) {
    const nameMatch = component.name.toLowerCase();
    const relevance = calculateRelevance(nameMatch, normalizedQuery);
    
    if (relevance > 0) {
      results.push({
        id: component.id,
        name: component.name,
        description: component.description,
        category: component.category,
        type: "component",
        package: "ui",
      });
    }
  }

  // Search hooks
  for (const hook of hooks) {
    const nameMatch = hook.name.toLowerCase();
    const relevance = calculateRelevance(nameMatch, normalizedQuery);
    
    if (relevance > 0) {
      results.push({
        id: hook.id,
        name: hook.name,
        description: hook.description,
        category: hook.category,
        type: "hook",
        package: "hook",
      });
    }
  }

  // Sort by relevance (exact matches first, then partial matches)
  return results.sort((a, b) => {
    const aRelevance = calculateRelevance(a.name.toLowerCase(), normalizedQuery);
    const bRelevance = calculateRelevance(b.name.toLowerCase(), normalizedQuery);
    return bRelevance - aRelevance;
  });
}

/**
 * Calculates relevance score for search matching
 * Returns 0 if no match, higher score for better matches
 */
function calculateRelevance(text: string, query: string): number {
  // Exact match gets highest score
  if (text === query) {
    return 100;
  }

  // Starts with query gets high score
  if (text.startsWith(query)) {
    return 80;
  }

  // Contains query gets medium score
  if (text.includes(query)) {
    return 50;
  }

  // No match
  return 0;
}

/**
 * Limits search results to top N results
 */
export function limitSearchResults(
  results: SearchResult[],
  limit = 20,
): SearchResult[] {
  return results.slice(0, limit);
}

