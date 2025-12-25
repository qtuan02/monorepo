import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@monorepo/ui";
import { cn } from "@monorepo/ui/libs/cn";

import SearchResults from "./search-results";
import type { SearchResult } from "~/lib/search-utils";

interface SearchBarProps {
  onSearch: (query: string) => SearchResult[];
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

export default function SearchBar({
  onSearch,
  onResultSelect,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounce search query (300ms as per requirements)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      const searchResults = onSearch(debouncedQuery);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, onSearch]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleResultSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    onResultSelect?.(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search components and hooks..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10"
          aria-label="Search components and hooks"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          data-testid="search-bar"
        />
      </div>
      {isOpen && results.length > 0 && (
        <SearchResults
          results={results}
          onSelect={handleResultSelect}
          query={debouncedQuery}
        />
      )}
    </div>
  );
}

