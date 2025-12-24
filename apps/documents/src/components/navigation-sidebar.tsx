import { useState } from "react";
import { ChevronDown, ChevronRight, Code, Component } from "lucide-react";
import { Link, useLocation } from "react-router";

import { cn } from "@monorepo/ui/libs/cn";

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
        "sidebar-item group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isSubItem ? "ml-4 border-l border-gray-100 pl-4 text-xs" : "",
        isActive
          ? "sidebar-item-active bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-semibold"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        isSubItem && isActive && "border-primary",
      )}
      onClick={onClick}
    >
      {label}
    </Link>
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

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({ components: true, hooks: true }); // Default both to expanded

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
          "scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 fixed top-0 left-0 z-40 h-full w-72 overflow-y-auto border-r bg-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 dark:bg-gray-900",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <nav className="p-4 pt-16 md:pt-4">
          {/* Components Section */}
          <div className="mb-8">
            <div
              className="mb-3 flex cursor-pointer items-center justify-between gap-2 px-2"
              onClick={() => toggleCategory("components")}
            >
              <Link
                to="/components"
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileOpen(false);
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Component className="size-4" />
                </div>
                <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase dark:text-gray-100">
                  Components
                </h2>
              </Link>
              <button
                className="ml-2 rounded-sm p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory("components");
                }}
              >
                {expandedCategories.components ? (
                  <ChevronDown className="size-4 opacity-50" />
                ) : (
                  <ChevronRight className="size-4 opacity-50" />
                )}
              </button>
            </div>
            {expandedCategories.components && (
              <ul className="space-y-1">
                {components
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((component) => (
                    <li key={component.id}>
                      <NavItem
                        label={component.name}
                        path={`/components/${component.id}`}
                        isActive={activePath === `/components/${component.id}`}
                        onClick={() => setIsMobileOpen(false)}
                        isSubItem
                      />
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Hooks Section */}
          <div>
            <div
              className="mb-3 flex cursor-pointer items-center justify-between gap-2 px-2"
              onClick={() => toggleCategory("hooks")}
            >
              <Link
                to="/hooks"
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileOpen(false);
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Code className="size-4" />
                </div>
                <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase dark:text-gray-100">
                  Hooks
                </h2>
              </Link>
              <button
                className="ml-2 rounded-sm p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory("hooks");
                }}
              >
                {expandedCategories.hooks ? (
                  <ChevronDown className="size-4 opacity-50" />
                ) : (
                  <ChevronRight className="size-4 opacity-50" />
                )}
              </button>
            </div>
            {expandedCategories.hooks && (
              <ul className="space-y-1">
                {hooks
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((hook) => (
                    <li key={hook.id}>
                      <NavItem
                        label={hook.name}
                        path={`/hooks/${hook.id}`}
                        isActive={activePath === `/hooks/${hook.id}`}
                        onClick={() => setIsMobileOpen(false)}
                        isSubItem
                      />
                    </li>
                  ))}
              </ul>
            )}
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
