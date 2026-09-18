// Derived from hooks-ts useCopyToClipboard.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyToClipboard } from "../src/use-copy-to-clipboard";

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  it("should copy text to the clipboard and update state", async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    const [, copy] = result.current;

    const text = "Test copy text";

    await act(async () => {
      await copy(text);
    });

    expect(result.current[0]).toBe(text);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
  });

  it("should set state to null if clipboard write fails", async () => {
    const error = new Error("Clipboard access denied");
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(error);

    const { result } = renderHook(() => useCopyToClipboard());
    const [, copy] = result.current;

    const text = "Test failure";

    await act(async () => {
      await copy(text);
    });

    expect(result.current[0]).toBeNull();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
  });
});
