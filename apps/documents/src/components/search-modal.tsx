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

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const { components } = useComponentMetadata();
  const { hooks } = useHookMetadata();

  // Get all items or filtered results
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

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayItems.length]);

  // Handle keyboard navigation
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
  }, [open, displayItems, selectedIndex, onOpenChange]);

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
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl gap-0 border-gray-200 bg-white p-0 md:w-full dark:border-gray-800 dark:bg-black">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Components and Hooks</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative border-b border-gray-200 dark:border-gray-800">
          <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search components and hooks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 bg-transparent py-6 pr-4 pl-12 text-base text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white"
            autoFocus
          />
        </div>

        {/* Results List */}
        <div className="max-h-[500px] overflow-y-auto">
          {displayItems.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {query.trim()
                  ? "No results found"
                  : "No components or hooks available"}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {!query.trim() ? (
                <>
                  {/* UI Introduction Section */}
                  <div className="px-2 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
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
                            className={cn(
                              "group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-all",
                              index === selectedIndex
                                ? "bg-gray-100 dark:bg-gray-900"
                                : "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                            )}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className="mt-0.5 flex-shrink-0 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-black uppercase dark:border-gray-700 dark:bg-black dark:text-white">
                              C
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "truncate font-medium text-black dark:text-white",
                                    index === selectedIndex &&
                                      "text-black dark:text-white",
                                  )}
                                >
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>

                  {/* Hook Introduction Section */}
                  <div className="px-2 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
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
                            className={cn(
                              "group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-all",
                              index === selectedIndex
                                ? "bg-gray-100 dark:bg-gray-900"
                                : "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                            )}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className="mt-0.5 flex-shrink-0 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-black uppercase dark:border-gray-700 dark:bg-black dark:text-white">
                              H
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "truncate font-medium text-black dark:text-white",
                                    index === selectedIndex &&
                                      "text-black dark:text-white",
                                  )}
                                >
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </>
              ) : (
                /* Search Results */
                <ul role="listbox" className="space-y-1">
                  {displayItems.map((item, index) => (
                    <li
                      key={`${item.type}-${item.id}`}
                      role="option"
                      aria-selected={index === selectedIndex}
                      className={cn(
                        "group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-all",
                        index === selectedIndex
                          ? "bg-gray-100 dark:bg-gray-900"
                          : "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                      )}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {/* Type Badge */}
                      <div
                        className={cn(
                          "mt-0.5 flex-shrink-0 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-black uppercase dark:border-gray-700 dark:bg-black dark:text-white",
                        )}
                      >
                        {item.type === "component" ? "C" : "H"}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "truncate font-medium text-black dark:text-white",
                              index === selectedIndex &&
                                "text-black dark:text-white",
                            )}
                          >
                            {item.name}
                          </span>
                          {item.category && (
                            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                              · {item.category}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Enter hint on selected */}
                      {index === selectedIndex && (
                        <div className="flex flex-shrink-0 items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-700 dark:bg-black">
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

        {/* Footer with shortcuts hint */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-black">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-black">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-black">
                  ↵
                </kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-black">
                  ESC
                </kbd>
                Close
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="size-3" />
              <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-black">
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
