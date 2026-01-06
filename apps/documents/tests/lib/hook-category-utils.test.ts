import { describe, it, expect } from "vitest";

import {
  hookCategoryToSlug,
  slugToHookCategory,
  isValidHookCategorySlug,
  filterHooksByCategory,
} from "~/utils/hook-category-utils";
import type { HookMetadata } from "~/types/hook-metadata";

describe("hook-category-utils", () => {
  describe("hookCategoryToSlug", () => {
    it("converts hook category names to URL slugs", () => {
      expect(hookCategoryToSlug("Client-side")).toBe("client-side");
      expect(hookCategoryToSlug("Utilities")).toBe("utilities");
      expect(hookCategoryToSlug("Uncategorized")).toBe("uncategorized");
    });
  });

  describe("slugToHookCategory", () => {
    it("converts URL slugs to hook category names", () => {
      expect(slugToHookCategory("client-side")).toBe("Client-side");
      expect(slugToHookCategory("utilities")).toBe("Utilities");
      expect(slugToHookCategory("uncategorized")).toBe("Uncategorized");
    });

    it("returns Uncategorized for invalid slugs", () => {
      expect(slugToHookCategory("invalid-slug")).toBe("Uncategorized");
    });
  });

  describe("isValidHookCategorySlug", () => {
    it("validates valid hook category slugs", () => {
      expect(isValidHookCategorySlug("client-side")).toBe(true);
      expect(isValidHookCategorySlug("utilities")).toBe(true);
      expect(isValidHookCategorySlug("uncategorized")).toBe(true);
    });

    it("rejects invalid hook category slugs", () => {
      expect(isValidHookCategorySlug("invalid")).toBe(false);
      expect(isValidHookCategorySlug("")).toBe(false);
    });
  });

  describe("filterHooksByCategory", () => {
    it("filters hooks by category", () => {
      const hooks: HookMetadata[] = [
        {
          id: "1",
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
          id: "2",
          name: "useDebounce",
          description: "A debounce hook",
          category: "Utilities",
          package: "hook",
          filePath: "use-debounce.ts",
          parameters: [],
          returns: { type: "T" },
          sourceCode: "",
        },
        {
          id: "3",
          name: "useClickOutside",
          description: "A click outside hook",
          category: "Client-side",
          package: "hook",
          filePath: "use-click-outside.ts",
          parameters: [],
          returns: { type: "void" },
          sourceCode: "",
        },
      ];

      const filtered = filterHooksByCategory(hooks, "client-side");
      expect(filtered).toHaveLength(2);
      expect(filtered[0]?.name).toBe("useToggle");
      expect(filtered[1]?.name).toBe("useClickOutside");
    });

    it("returns empty array when no hooks match", () => {
      const hooks: HookMetadata[] = [
        {
          id: "1",
          name: "useToggle",
          description: "A toggle hook",
          category: "Client-side",
          package: "hook",
          filePath: "use-toggle.ts",
          parameters: [],
          returns: { type: "boolean" },
          sourceCode: "",
        },
      ];

      const filtered = filterHooksByCategory(hooks, "utilities");
      expect(filtered).toHaveLength(0);
    });
  });
});

