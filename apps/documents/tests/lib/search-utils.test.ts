import { describe, expect, it } from "vitest";

import type { SearchResult } from "~/lib/search-utils";
import type { ComponentMetadata } from "~/types/component-metadata";
import type { HookMetadata } from "~/types/hook-metadata";
import {
  limitSearchResults,
  searchComponentsAndHooks,
} from "~/lib/search-utils";

describe("search-utils", () => {
  const mockComponents: ComponentMetadata[] = [
    {
      id: "button",
      name: "Button",
      description: "A button component",
      category: "Form",
      parentCategory: "shadcn",
      package: "ui",
      filePath: "button.tsx",
      props: [],
      sourceCode: "",
    },
    {
      id: "input",
      name: "Input",
      description: "An input component",
      category: "Form",
      parentCategory: "shadcn",
      package: "ui",
      filePath: "input.tsx",
      props: [],
      sourceCode: "",
    },
  ];

  const mockHooks: HookMetadata[] = [
    {
      id: "use-toggle",
      name: "useToggle",
      description: "A toggle hook",
      category: "Client-side",
      package: "hook",
      filePath: "use-toggle.ts",
      parameters: [],
      returns: { type: "boolean" },
      sourceCode: "",
    },
    {
      id: "use-debounce",
      name: "useDebounce",
      description: "A debounce hook",
      category: "Utilities",
      package: "hook",
      filePath: "use-debounce.ts",
      parameters: [],
      returns: { type: "T" },
      sourceCode: "",
    },
  ];

  describe("searchComponentsAndHooks", () => {
    it("searches components by name (case-insensitive)", () => {
      const results = searchComponentsAndHooks("button", mockComponents, []);
      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe("Button");
      expect(results[0]?.type).toBe("component");
    });

    it("searches hooks by name (case-insensitive)", () => {
      const results = searchComponentsAndHooks(
        "toggle",
        mockComponents,
        mockHooks,
      );
      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe("useToggle");
      expect(results[0]?.type).toBe("hook");
    });

    it("searches across both components and hooks", () => {
      const results = searchComponentsAndHooks("u", mockComponents, mockHooks);
      expect(results.length).toBeGreaterThan(0);
      const componentResults = results.filter((r) => r.type === "component");
      const hookResults = results.filter((r) => r.type === "hook");
      // "u" matches "Input" (component) and "useToggle", "useDebounce" (hooks)
      expect(componentResults.length).toBeGreaterThan(0);
      expect(hookResults.length).toBeGreaterThan(0);
    });

    it("returns empty array for empty query", () => {
      const results = searchComponentsAndHooks("", mockComponents, mockHooks);
      expect(results).toHaveLength(0);
    });

    it("returns empty array for whitespace-only query", () => {
      const results = searchComponentsAndHooks(
        "   ",
        mockComponents,
        mockHooks,
      );
      expect(results).toHaveLength(0);
    });

    it("performs partial matching", () => {
      const results = searchComponentsAndHooks("but", mockComponents, []);
      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe("Button");
    });

    it("prioritizes exact matches", () => {
      const results = searchComponentsAndHooks("button", mockComponents, []);
      expect(results[0]?.name).toBe("Button");
    });

    it("is case-insensitive", () => {
      const results1 = searchComponentsAndHooks("BUTTON", mockComponents, []);
      const results2 = searchComponentsAndHooks("button", mockComponents, []);
      expect(results1).toEqual(results2);
    });
  });

  describe("limitSearchResults", () => {
    const manyResults: SearchResult[] = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      name: `Item ${i}`,
      description: null,
      category: "Test",
      type: "component",
      package: "ui",
    }));

    it("limits results to specified number", () => {
      const limited = limitSearchResults(manyResults, 10);
      expect(limited).toHaveLength(10);
    });

    it("uses default limit of 20", () => {
      const limited = limitSearchResults(manyResults);
      expect(limited).toHaveLength(20);
    });

    it("returns all results if limit is greater than results length", () => {
      const limited = limitSearchResults(manyResults, 100);
      expect(limited).toHaveLength(50);
    });
  });
});
