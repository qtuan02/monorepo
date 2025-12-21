import { describe, it, expect } from "vitest";

import {
  categoryToSlug,
  slugToCategory,
  isValidCategorySlug,
  filterComponentsByCategory,
} from "~/lib/category-utils";
import type { ComponentMetadata } from "~/types/component-metadata";

describe("category-utils", () => {
  describe("categoryToSlug", () => {
    it("converts category names to URL slugs", () => {
      expect(categoryToSlug("Form")).toBe("form");
      expect(categoryToSlug("Data Display")).toBe("data-display");
      expect(categoryToSlug("Uncategorized")).toBe("uncategorized");
    });
  });

  describe("slugToCategory", () => {
    it("converts URL slugs to category names", () => {
      expect(slugToCategory("form")).toBe("Form");
      expect(slugToCategory("data-display")).toBe("Data Display");
      expect(slugToCategory("uncategorized")).toBe("Uncategorized");
    });

    it("returns Uncategorized for invalid slugs", () => {
      expect(slugToCategory("invalid-slug")).toBe("Uncategorized");
    });
  });

  describe("isValidCategorySlug", () => {
    it("validates valid category slugs", () => {
      expect(isValidCategorySlug("form")).toBe(true);
      expect(isValidCategorySlug("data-display")).toBe(true);
      expect(isValidCategorySlug("navigation")).toBe(true);
    });

    it("rejects invalid category slugs", () => {
      expect(isValidCategorySlug("invalid")).toBe(false);
      expect(isValidCategorySlug("")).toBe(false);
    });
  });

  describe("filterComponentsByCategory", () => {
    it("filters components by category", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "Button",
          description: "A button component",
          category: "Form",
          package: "ui",
          filePath: "button.tsx",
          props: [],
          sourceCode: "",
        },
        {
          id: "2",
          name: "Card",
          description: "A card component",
          category: "Layout",
          package: "ui",
          filePath: "card.tsx",
          props: [],
          sourceCode: "",
        },
        {
          id: "3",
          name: "Input",
          description: "An input component",
          category: "Form",
          package: "ui",
          filePath: "input.tsx",
          props: [],
          sourceCode: "",
        },
      ];

      const filtered = filterComponentsByCategory(components, "form");
      expect(filtered).toHaveLength(2);
      expect(filtered[0]?.name).toBe("Button");
      expect(filtered[1]?.name).toBe("Input");
    });

    it("returns empty array when no components match", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "Button",
          description: "A button component",
          category: "Form",
          package: "ui",
          filePath: "button.tsx",
          props: [],
          sourceCode: "",
        },
      ];

      const filtered = filterComponentsByCategory(components, "layout");
      expect(filtered).toHaveLength(0);
    });
  });
});

