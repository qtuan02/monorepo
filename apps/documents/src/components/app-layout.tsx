import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@monorepo/ui";

import NavigationSidebar from "./navigation-sidebar";
import SearchModal from "./search-modal";
import ThemeSwitcher from "./theme-switcher";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd/Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar currentPath={currentPath} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header with Search Button and Theme Switcher */}
        <header className="sticky top-0 z-30 border-b bg-white px-6 py-4 pl-16 md:px-12 md:pl-12 dark:bg-gray-900">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <div className="flex-1">
              <Button
                variant="outline"
                className="w-full max-w-md justify-start text-left font-normal text-gray-500 dark:text-gray-400"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="mr-2 size-4" />
                <span>Search components and hooks...</span>
                <kbd className="pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600 opacity-100 select-none dark:bg-gray-700 dark:text-gray-300">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <ThemeSwitcher />
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
