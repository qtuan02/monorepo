import { useState } from "react";
import { Link } from "react-router";
import { cn } from "@monorepo/ui/libs/cn";

import { CATEGORIES, categoryToSlug } from "~/lib/category-utils";

interface CategorySidebarProps {
  currentCategory: string;
}

export default function CategorySidebar({ currentCategory }: CategorySidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r bg-white transition-transform dark:bg-gray-900 md:relative md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <nav className="p-4 pt-16 md:pt-4">
          <h2 className="mb-4 text-lg font-semibold">Categories</h2>
          <ul className="space-y-2">
            {CATEGORIES.map((category) => {
              const slug = categoryToSlug(category);
              const isActive = currentCategory === slug;
              return (
                <li key={category}>
                  <Link
                    to={`/components/${slug}`}
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

