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

  // Prevent scroll restoration on page reload
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <NavigationSidebar currentPath={currentPath} />
      <div className="flex min-w-0 flex-1 flex-col md:ml-72">
        {/* Header with Search Button and Theme Switcher - FIXED at top */}
        <header className="fixed top-0 right-0 left-0 z-30 border-b bg-white px-4 py-3 md:left-72 md:px-12 dark:bg-gray-900">
          <div className="mx-auto flex max-w-7xl items-center gap-2 md:gap-4">
            <div className="min-w-0 flex-1">
              <Button
                variant="outline"
                className="w-full max-w-md justify-start text-left font-normal text-gray-500 dark:text-gray-400"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="size-4 flex-shrink-0" />
                {/* Hide text on very small screens */}
                <span className="ml-2 hidden truncate sm:inline">
                  Search components and hooks...
                </span>
                {/* Show shortened text on small screens */}
                <span className="ml-2 truncate sm:hidden">Search...</span>
                {/* Hide keyboard shortcut on mobile */}
                <kbd className="pointer-events-none ml-auto hidden h-5 items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600 opacity-100 select-none md:inline-flex dark:bg-gray-700 dark:text-gray-300">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <ThemeSwitcher />
          </div>
        </header>
        {/* Main Content - Add top padding to account for fixed header */}
        <main className="flex-1 overflow-x-hidden pt-[57px] md:pt-[61px]">
          {children}
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
