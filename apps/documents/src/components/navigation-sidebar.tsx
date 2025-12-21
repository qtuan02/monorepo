import { useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@monorepo/ui/libs/cn";
import { Component, Code } from "lucide-react";

import { CATEGORIES, categoryToSlug } from "~/lib/category-utils";
import { HOOK_CATEGORIES, hookCategoryToSlug } from "~/lib/hook-category-utils";

interface NavigationSidebarProps {
  currentPath?: string; // Optional, component uses useLocation() internally
}

export default function NavigationSidebar({ currentPath: _currentPath }: NavigationSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isComponentPath = location.pathname.startsWith("/components");
  const isHookPath = location.pathname.startsWith("/hooks");
  
  // Use location.pathname for active state (more reliable than prop)
  const activePath = location.pathname;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        <div className="space-y-1.5">
          <span
            className={cn(
              "block h-0.5 w-6 bg-gray-900 transition-all dark:bg-gray-100",
              isMobileOpen && "translate-y-2 rotate-45",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-6 bg-gray-900 transition-all dark:bg-gray-100",
              isMobileOpen && "opacity-0",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-6 bg-gray-900 transition-all dark:bg-gray-100",
              isMobileOpen && "-translate-y-2 -rotate-45",
            )}
          />
        </div>
      </button>

      {/* Sidebar */}
      <aside
        role="complementary"
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r bg-white transition-transform dark:bg-gray-900 md:relative md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <nav className="p-4 pt-16 md:pt-4">
          {/* Components Section */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Component className="size-4 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold">Components</h2>
            </div>
            <ul className="space-y-2">
              {CATEGORIES.map((category) => {
                const slug = categoryToSlug(category);
                const path = `/components/${slug}`;
                const isActive = isComponentPath && activePath === path;
                return (
                  <li key={category}>
                    <Link
                      to={path}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {category}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Hooks Section */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Code className="size-4 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold">Hooks</h2>
            </div>
            <ul className="space-y-2">
              {HOOK_CATEGORIES.map((category) => {
                const slug = hookCategoryToSlug(category);
                const path = `/hooks/${slug}`;
                const isActive = isHookPath && activePath === path;
                return (
                  <li key={category}>
                    <Link
                      to={path}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {category}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

