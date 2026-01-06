import { describe, expect, it } from "vitest";

import type { ComponentMetadata } from "~/types/component-metadata";
import {
  categoryToSlug,
  filterComponentsByCategory,
  isValidCategorySlug,
  slugToCategory,
} from "~/utils/category-utils";

describe("category-utils", () => {
  describe("categoryToSlug", () => {
    it("converts category names to URL slugs", () => {
      expect(categoryToSlug("ui")).toBe("ui");
      expect(categoryToSlug("Form")).toBe("form");
      expect(categoryToSlug("Data Display")).toBe("data-display");
      expect(categoryToSlug("Uncategorized")).toBe("uncategorized");
    });
  });

  describe("slugToCategory", () => {
    it("converts URL slugs to category names", () => {
      expect(slugToCategory("ui")).toBe("ui");
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
      expect(isValidCategorySlug("ui")).toBe(true);
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
          category: "ui",
          parentCategory: "shadcn",
          package: "ui",
          filePath: "button.tsx",
          props: [],
          sourceCode: "",
        },
        {
          id: "2",
          name: "Card",
          description: "A card component",
          category: "ui",
          parentCategory: "shadcn",
          package: "ui",
          filePath: "card.tsx",
          props: [],
          sourceCode: "",
        },
        {
          id: "3",
          name: "Input",
          description: "An input component",
          category: "ui",
          parentCategory: "shadcn",
          package: "ui",
          filePath: "input.tsx",
          props: [],
          sourceCode: "",
        },
      ];

      const filtered = filterComponentsByCategory(components, "ui");
      expect(filtered).toHaveLength(3);
      expect(filtered[0]?.name).toBe("Button");
      expect(filtered[1]?.name).toBe("Card");
      expect(filtered[2]?.name).toBe("Input");
    });

    it("returns empty array when no components match", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "Button",
          description: "A button component",
          category: "ui",
          parentCategory: "shadcn",
          package: "ui",
          filePath: "button.tsx",
          props: [],
          sourceCode: "",
        },
      ];

      const filtered = filterComponentsByCategory(components, "form");
      expect(filtered).toHaveLength(0);
    });
  });
});
