// Derived from hooks-ts useBoolean.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useState } from "react";

type UseBooleanReturnType = {
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
};

/**
 * Boolean state with toggle, setTrue and setFalse helpers alongside the raw setter.
 *
 * @example
 * const { value: open, setTrue: openDialog, setFalse: closeDialog } = useBoolean();
 *
 * <Button onClick={openDialog}>Mở</Button>;
 * <Dialog open={open} onOpenChange={(next) => (next ? openDialog() : closeDialog())} />;
 */
export function useBoolean(initialValue = false): UseBooleanReturnType {
  if (typeof initialValue !== "boolean") {
    throw new Error("useBoolean: Initial value must be a boolean");
  }
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, setValue, toggle, setTrue, setFalse };
}
