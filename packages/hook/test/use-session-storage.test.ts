// Derived from hooks-ts useSessionStorage.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionStorage } from "../src/use-session-storage";
import { sessionStorageMock } from "./support/storage-mock";

describe("useSessionStorage", () => {
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
  });

  const key = "testKey";

  beforeEach(() => {
    sessionStorageMock.clear();
  });

  it("should initialize with the initial value if no value is in sessionStorage", () => {
    const { result } = renderHook(() => useSessionStorage(key, "defaultValue"));
    expect(result.current[0]).toBe("defaultValue");
  });

  it("should initialize with the value from sessionStorage if it exists", () => {
    sessionStorageMock.setItem(key, JSON.stringify("storedValue"));
    const { result } = renderHook(() => useSessionStorage(key, "defaultValue"));
    expect(result.current[0]).toBe("storedValue");
  });

  it("should update the value in state and sessionStorage when setValue is called", () => {
    const { result } = renderHook(() => useSessionStorage(key, "defaultValue"));

    act(() => {
      result.current[1]("newValue");
    });

    expect(result.current[0]).toBe("newValue");
    expect(sessionStorageMock.getItem(key)).toBe(JSON.stringify("newValue"));
  });

  it("should remove the value from state and sessionStorage when removeValue is called", () => {
    sessionStorageMock.setItem(key, JSON.stringify("storedValue"));
    const { result } = renderHook(() => useSessionStorage(key, "defaultValue"));

    act(() => {
      result.current[2](); // Call removeValue
    });

    expect(result.current[0]).toBe("defaultValue");
    expect(sessionStorageMock.getItem(key)).toBeNull();
  });

  it("should handle multiple updates to sessionStorage correctly", () => {
    const { result } = renderHook(() => useSessionStorage(key, 0));

    act(() => {
      result.current[1](10);
    });

    expect(result.current[0]).toBe(10);
    expect(sessionStorageMock.getItem(key)).toBe(JSON.stringify(10));

    act(() => {
      result.current[1](20);
    });

    expect(result.current[0]).toBe(20);
    expect(sessionStorageMock.getItem(key)).toBe(JSON.stringify(20));
  });

  it("should gracefully handle JSON parse errors", () => {
    sessionStorageMock.setItem(key, "invalid JSON");
    const { result } = renderHook(() => useSessionStorage(key, "defaultValue"));

    expect(result.current[0]).toBe("defaultValue"); // Fallback to initialValue
  });

  it("should gracefully handle sessionStorage removal errors", () => {
    const { result } = renderHook(() => useSessionStorage(key, "defaultValue"));
    vi.spyOn(sessionStorageMock, "removeItem").mockImplementation(() => {
      throw new Error("Remove error");
    });

    act(() => {
      result.current[2](); // Call removeValue
    });

    expect(result.current[0]).toBe("defaultValue"); // State should reset to initialValue
  });
});
