import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Code,
  Component,
  Layout,
} from "lucide-react";
import { Link, useLocation } from "react-router";

import { cn } from "@monorepo/ui/libs/cn";

import { CATEGORIES, categoryToSlug } from "~/lib/category-utils";
import { HOOK_CATEGORIES, hookCategoryToSlug } from "~/lib/hook-category-utils";
import { useComponentMetadata } from "~/lib/use-component-metadata";
import { useHookMetadata } from "~/lib/use-hook-metadata";

interface NavigationSidebarProps {
  currentPath?: string;
}

interface NavItemProps {
  label: string;
  path: string;
  isActive: boolean;
  onClick?: () => void;
  isSubItem?: boolean;
}

function NavItem({
  label,
  path,
  isActive,
  onClick,
  isSubItem = false,
}: NavItemProps) {
  return (
    <Link
      to={path}
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isSubItem ? "ml-4 border-l border-gray-100 pl-4 text-xs" : "",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-semibold"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        isSubItem && isActive && "border-primary",
      )}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

interface SidebarCategoryProps {
  title: string;
  path: string;
  items: { label: string; path: string }[];
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: () => void;
  activePath: string;
}

function SidebarCategory({
  title,
  path,
  items,
  isActive,
  isExpanded,
  onToggle,
  onItemClick,
  activePath,
}: SidebarCategoryProps) {
  return (
    <li className="mb-1">
      <div
        className={cn(
          "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors select-none",
          isActive
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800",
        )}
        onClick={onToggle}
      >
        <Link
          to={path}
          className="flex-1 truncate"
          onClick={(e) => {
            // If checking category page directly
            onItemClick();
          }}
        >
          {title}
        </Link>
        <button
          className="ml-2 rounded-sm p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="size-4 opacity-50" />
          ) : (
            <ChevronRight className="size-4 opacity-50" />
          )}
        </button>
      </div>

      {isExpanded && items.length > 0 && (
        <ul className="mt-1 space-y-1">
          {items.map((item) => (
            <li key={item.path}>
              <NavItem
                label={item.label}
                path={item.path}
                isActive={activePath === item.path}
                onClick={onItemClick}
                isSubItem
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function NavigationSidebar({
  currentPath: _currentPath,
}: NavigationSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { components } = useComponentMetadata();
  const { hooks } = useHookMetadata();

  const activePath = location.pathname;

  // Track expanded categories
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // Auto-expand current active category on mount or path change
  useEffect(() => {
    // Check component categories
    CATEGORIES.forEach((category) => {
      const slug = categoryToSlug(category);
      // Expand if current path is in this category
      if (activePath.includes(`/components/${slug}`)) {
        setExpandedCategories((prev) => ({
          ...prev,
          [`component-${category}`]: true,
        }));
      }
    });

    // Check hook categories
    HOOK_CATEGORIES.forEach((category) => {
      const slug = hookCategoryToSlug(category);
      if (activePath.includes(`/hooks/${slug}`)) {
        setExpandedCategories((prev) => ({
          ...prev,
          [`hook-${category}`]: true,
        }));
      }
    });
  }, [activePath]);

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden"
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
          "scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 fixed top-0 left-0 z-40 h-full w-72 overflow-y-auto border-r bg-white transition-transform md:relative md:translate-x-0 dark:bg-gray-900",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <nav className="p-4 pt-16 md:pt-4">
          {/* Components Section */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 px-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Component className="size-4" />
              </div>
              <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase dark:text-gray-100">
                Components
              </h2>
            </div>
            <ul className="space-y-1">
              {CATEGORIES.map((category) => {
                const slug = categoryToSlug(category);
                const categoryPath = `/components/${slug}`;
                const isActive = activePath.startsWith(categoryPath);
                const categoryKey = `component-${category}`;

                // Get components in this category
                const categoryComponents = components
                  .filter((c) => c.category === category)
                  .map((c) => ({
                    label: c.name,
                    path: `/components/${slug}/${c.id}`,
                  }));

                return (
                  <SidebarCategory
                    key={category}
                    title={category}
                    path={categoryPath}
                    items={categoryComponents}
                    isActive={isActive}
                    isExpanded={expandedCategories[categoryKey] || false}
                    onToggle={() => toggleCategory(categoryKey)}
                    onItemClick={() => setIsMobileOpen(false)}
                    activePath={activePath}
                  />
                );
              })}
            </ul>
          </div>

          {/* Hooks Section */}
          <div>
            <div className="mb-3 flex items-center gap-2 px-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Code className="size-4" />
              </div>
              <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase dark:text-gray-100">
                Hooks
              </h2>
            </div>
            <ul className="space-y-1">
              {HOOK_CATEGORIES.map((category) => {
                const slug = hookCategoryToSlug(category);
                const categoryPath = `/hooks/${slug}`;
                const isActive = activePath.startsWith(categoryPath);
                const categoryKey = `hook-${category}`;

                // Get hooks in this category
                const categoryHooks = hooks
                  .filter((h) => h.category === category)
                  .map((h) => ({
                    label: h.name,
                    path: `/hooks/${slug}/${h.id}`,
                  }));

                return (
                  <SidebarCategory
                    key={category}
                    title={category}
                    path={categoryPath}
                    items={categoryHooks}
                    isActive={isActive}
                    isExpanded={expandedCategories[categoryKey] || false}
                    onToggle={() => toggleCategory(categoryKey)}
                    onItemClick={() => setIsMobileOpen(false)}
                    activePath={activePath}
                  />
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
