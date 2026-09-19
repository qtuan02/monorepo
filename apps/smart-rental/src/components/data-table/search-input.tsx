import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { useDebounce } from "@monorepo/hook/use-debounce";
import { Button } from "@monorepo/ui/components/button";
import { Input } from "@monorepo/ui/components/input";

interface SearchInputProps {
  /** The committed value — what the URL holds. */
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * A search box that commits 300ms after the last keystroke. The field binds to
 * its own immediate text so typing never lags; only the committed value is
 * debounced (see patterns-debounce-search-input.md).
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: SearchInputProps) {
  const [text, setText] = useState(value);
  const debouncedText = useDebounce(text, 300);

  // The URL is the source of truth, so a value that changed from outside —
  // "Xóa bộ lọc", Back — replaces the draft. A change that merely caught up
  // with our own debounced commit is not "outside", and resetting on it
  // would drop the keystrokes typed since.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== debouncedText) setText(value);
  }

  // Syncing the settled draft into the URL — an external system to React.
  // biome-ignore lint/correctness/useExhaustiveDependencies: commits only when the draft settles; re-running on `value` would re-commit a stale draft over an outside reset
  useEffect(() => {
    if (debouncedText !== value) onChange(debouncedText);
  }, [debouncedText]);

  return (
    <div className="relative">
      <Search className="text-muted-foreground/60 pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
      <Input
        type="search"
        value={text}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setText(event.target.value)}
        className="h-8 w-28 pl-7 sm:w-40 lg:w-64"
      />
      {text && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Xóa từ khóa tìm kiếm"
          className="text-muted-foreground/60 hover:text-foreground absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => setText("")}
        >
          <X />
        </Button>
      )}
    </div>
  );
}
