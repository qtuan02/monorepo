import type { SearchResult } from "~/lib/search-utils";
import { useSearch } from "~/lib/use-search";
import NavigationSidebar from "./navigation-sidebar";
import SearchBar from "./search-bar";
import ThemeSwitcher from "./theme-switcher";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
  const { search } = useSearch();

  const handleResultSelect = (_result: SearchResult) => {
    // Navigation is handled in SearchResults component
    // This callback can be used for analytics or other side effects
  };

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar currentPath={currentPath} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header with Search Bar and Theme Switcher */}
        <header className="sticky top-0 z-50 border-b bg-white px-6 py-4 md:px-12 dark:bg-gray-900">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <div className="flex-1">
              <SearchBar
                onSearch={search}
                onResultSelect={handleResultSelect}
              />
            </div>
            <ThemeSwitcher />
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
