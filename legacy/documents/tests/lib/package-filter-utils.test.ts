import { describe, expect, it } from "vitest";

import type { ComponentMetadata } from "~/types/component-metadata";
import type { HookMetadata } from "~/types/hook-metadata";
import {
  filterComponentsByPackage,
  filterHooksByPackage,
  getPackageFilterFromUrl,
  isValidPackageFilter,
} from "~/utils/package-filter-utils";

describe("package-filter-utils", () => {
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
  ];

  describe("filterComponentsByPackage", () => {
    it("returns all components when filter is 'all'", () => {
      const filtered = filterComponentsByPackage(mockComponents, "all");
      expect(filtered).toEqual(mockComponents);
    });

    it("returns all components when filter is 'ui'", () => {
      const filtered = filterComponentsByPackage(mockComponents, "ui");
      expect(filtered).toEqual(mockComponents);
    });

    it("returns empty array when filter is 'hook'", () => {
      const filtered = filterComponentsByPackage(mockComponents, "hook");
      expect(filtered).toEqual([]);
    });
  });

  describe("filterHooksByPackage", () => {
    it("returns all hooks when filter is 'all'", () => {
      const filtered = filterHooksByPackage(mockHooks, "all");
      expect(filtered).toEqual(mockHooks);
    });

    it("returns all hooks when filter is 'hook'", () => {
      const filtered = filterHooksByPackage(mockHooks, "hook");
      expect(filtered).toEqual(mockHooks);
    });

    it("returns empty array when filter is 'ui'", () => {
      const filtered = filterHooksByPackage(mockHooks, "ui");
      expect(filtered).toEqual([]);
    });
  });

  describe("isValidPackageFilter", () => {
    it("validates valid package filter values", () => {
      expect(isValidPackageFilter("all")).toBe(true);
      expect(isValidPackageFilter("ui")).toBe(true);
      expect(isValidPackageFilter("hook")).toBe(true);
    });

    it("rejects invalid package filter values", () => {
      expect(isValidPackageFilter("invalid")).toBe(false);
      expect(isValidPackageFilter(null)).toBe(false);
      expect(isValidPackageFilter("")).toBe(false);
    });
  });

  describe("getPackageFilterFromUrl", () => {
    it("returns filter from URL search params", () => {
      const params = new URLSearchParams("package=ui");
      expect(getPackageFilterFromUrl(params)).toBe("ui");
    });

    it("returns 'all' as default when no package param", () => {
      const params = new URLSearchParams();
      expect(getPackageFilterFromUrl(params)).toBe("all");
    });

    it("returns 'all' as default when invalid package param", () => {
      const params = new URLSearchParams("package=invalid");
      expect(getPackageFilterFromUrl(params)).toBe("all");
    });
  });
});
