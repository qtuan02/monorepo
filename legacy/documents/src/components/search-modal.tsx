import { useCallback, useEffect, useState } from "react";
import { Command, Search } from "lucide-react";
import { useNavigate } from "react-router";

import { Input } from "@monorepo/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@monorepo/ui/components/dialog";
import { cn } from "@monorepo/ui/libs/cn";

import type { SearchResult } from "~/utils/search-utils";
import { useComponentMetadata } from "~/hooks/use-component-metadata";
import { useHookMetadata } from "~/hooks/use-hook-metadata";
import { searchComponentsAndHooks } from "~/utils/search-utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const resultRowClass = (selected: boolean) =>
  cn(
    "group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-all",
    selected ? "bg-muted" : "hover:bg-muted/50",
  );

const typeBadgeClass =
  "mt-0.5 shrink-0 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-foreground uppercase";

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const { components } = useComponentMetadata();
  const { hooks } = useHookMetadata();

  const allItems: SearchResult[] = [
    ...components.map((c) => ({
      id: c.id,
      name: c.name,
      type: "component" as const,
      description: c.description || "",
      category: c.category,
      package: c.package,
    })),
    ...hooks.map((h) => ({
      id: h.id,
      name: h.name,
      type: "hook" as const,
      description: h.description || "",
      category: h.category,
      package: h.package,
    })),
  ];

  const displayItems = query.trim()
    ? searchComponentsAndHooks(query, components, hooks)
    : allItems;

  useEffect(() => {
    setSelectedIndex(0);
  }, [displayItems.length]);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      const path =
        item.type === "component"
          ? `/components/${item.id}`
          : `/hooks/${item.id}`;
      navigate(path);
      onOpenChange(false);
      setQuery("");
    },
    [navigate, onOpenChange],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < displayItems.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (displayItems[selectedIndex]) {
            handleSelect(displayItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, displayItems, selectedIndex, onOpenChange, handleSelect]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
      if (!newOpen) {
        setQuery("");
        setSelectedIndex(0);
      }
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border bg-background w-[calc(100%-2rem)] max-w-2xl gap-0 p-0 md:w-full">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Components and Hooks</DialogTitle>
        </DialogHeader>

        <div className="border-border relative border-b">
          <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search components and hooks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-foreground placeholder:text-muted-foreground border-0 bg-transparent py-6 pr-4 pl-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {displayItems.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-muted-foreground text-sm">
                {query.trim()
                  ? "No results found"
                  : "No components or hooks available"}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {!query.trim() ? (
                <>
                  <div className="text-muted-foreground px-2 py-2 text-xs font-semibold tracking-wider uppercase">
                    UI Introduction ({components.length})
                  </div>
                  <ul role="listbox" className="mb-4 space-y-1">
                    {displayItems
                      .filter((item) => item.type === "component")
                      .map((item) => {
                        const index = displayItems.indexOf(item);
                        return (
                          <li
                            key={`comp-${item.id}`}
                            role="option"
                            aria-selected={index === selectedIndex}
                            className={resultRowClass(index === selectedIndex)}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className={typeBadgeClass}>C</div>
                            <div className="min-w-0 flex-1">
                              <span className="text-foreground truncate font-medium">
                                {item.name}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                  </ul>

                  <div className="text-muted-foreground px-2 py-2 text-xs font-semibold tracking-wider uppercase">
                    Hook Introduction ({hooks.length})
                  </div>
                  <ul role="listbox" className="space-y-1">
                    {displayItems
                      .filter((item) => item.type === "hook")
                      .map((item) => {
                        const index = displayItems.indexOf(item);
                        return (
                          <li
                            key={`hook-${item.id}`}
                            role="option"
                            aria-selected={index === selectedIndex}
                            className={resultRowClass(index === selectedIndex)}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className={typeBadgeClass}>H</div>
                            <div className="min-w-0 flex-1">
                              <span className="text-foreground truncate font-medium">
                                {item.name}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </>
              ) : (
                <ul role="listbox" className="space-y-1">
                  {displayItems.map((item, index) => (
                    <li
                      key={`${item.type}-${item.id}`}
                      role="option"
                      aria-selected={index === selectedIndex}
                      className={resultRowClass(index === selectedIndex)}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className={typeBadgeClass}>
                        {item.type === "component" ? "C" : "H"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground truncate font-medium">
                            {item.name}
                          </span>
                          {item.category && (
                            <span className="text-muted-foreground truncate text-xs">
                              · {item.category}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-sm">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {index === selectedIndex && (
                        <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                          <kbd className="border-border bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]">
                            ↵
                          </kbd>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="border-border bg-muted/50 border-t px-4 py-3">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="border-border bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="border-border bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]">
                  ↵
                </kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="border-border bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]">
                  ESC
                </kbd>
                Close
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="size-3" />
              <kbd className="border-border bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]">
                K
              </kbd>
              Shortcut
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
