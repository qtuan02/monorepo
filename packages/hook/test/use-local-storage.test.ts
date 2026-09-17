// Derived from hooks-ts useLocalStorage.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useLocalStorage } from "../src/use-local-storage";
import { localStorageMock } from "./support/storage-mock";

describe("useLocalStorage", () => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });

  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should set and get value from localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("key", "value"));
    expect(result.current[0]).toBe("value");
  });

  it("should set value as array", () => {
    const { result } = renderHook(() => useLocalStorage("array", [1, 2]));

    expect(result.current[0]).toEqual([1, 2]);
  });
});
