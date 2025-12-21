import NavigationSidebar from "./navigation-sidebar";
import SearchBar from "./search-bar";
import { useSearch } from "~/lib/use-search";
import type { SearchResult } from "~/lib/search-utils";

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
      <div className="flex flex-1 flex-col">
        {/* Header with Search Bar */}
        <header className="border-b bg-white px-6 py-4 dark:bg-gray-900 md:px-8">
          <div className="mx-auto max-w-7xl">
            <SearchBar onSearch={search} onResultSelect={handleResultSelect} />
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

