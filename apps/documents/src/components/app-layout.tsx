import type { ImperativePanelHandle } from "react-resizable-panels";
import { useEffect, useRef, useState } from "react";
import { Github, PanelLeft, Search } from "lucide-react";
import { Outlet } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@monorepo/ui/components/resizable";
import { cn } from "@monorepo/ui/libs/cn";

import DashboardSidebarMobile, {
  DashboardSidebarContent,
} from "./dashboard-sidebar";
import SearchModal from "./search-modal";
import ThemeSwitcher from "./theme-switcher";

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const sidebarRef = useRef<ImperativePanelHandle>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const toggleSidebar = () => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      if (isSidebarCollapsed) {
        sidebar.expand();
        setIsSidebarCollapsed(false);
      } else {
        sidebar.collapse();
        setIsSidebarCollapsed(true);
      }
    }
  };

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
    <div className="flex h-[100dvh] w-full bg-white dark:bg-gray-950">
      {/* Mobile Sidebar (Fixed) */}
      <DashboardSidebarMobile />

      {/* Desktop Resizable Layout */}
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          ref={sidebarRef}
          defaultSize={18}
          minSize={15}
          maxSize={30}
          collapsible={true}
          collapsedSize={4}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          className={cn(
            "hidden border-r md:block",
            !isDragging && "transition-all duration-300 ease-in-out",
          )}
        >
          <DashboardSidebarContent isCollapsed={isSidebarCollapsed} />
        </ResizablePanel>

        <ResizableHandle
          className="hidden md:flex"
          onDragging={setIsDragging}
        />

        <ResizablePanel defaultSize={82}>
          <div className="flex h-full flex-col overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] dark:bg-gray-950">
              <div className="hidden md:flex">
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <PanelLeft
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      isSidebarCollapsed && "rotate-180",
                    )}
                  />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </div>
              <div className="flex flex-1 items-center gap-4 md:ml-auto md:w-auto md:flex-none">
                <Button
                  variant="outline"
                  className="text-muted-foreground relative w-full justify-start text-sm sm:w-64 sm:pr-12 md:w-80 lg:w-96"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search components...</span>
                  <kbd className="bg-muted pointer-events-none absolute top-1.5 right-1.5 hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href="https://github.com/qtuan02/monorepo/tree/main/apps/documents"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </a>
                </Button>
                <ThemeSwitcher />
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900/50">
              <Outlet />
            </main>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
