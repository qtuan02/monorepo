import * as React from "react";
import { Bot, ChevronRight, Code2, SquareTerminal } from "lucide-react";
import { Link, useLocation } from "react-router";

// Sidebar primitives not used as we implement manual layout below
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@monorepo/ui/components/collapsible";
// Since we don't have the actual Sidebar primitives in @monorepo/ui yet,
// we will implement a "Sidebar 07" look-alike using standard layout + existing components.
// We will mock the structure to look exactly like the requested design.

import { ScrollArea } from "@monorepo/ui/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@monorepo/ui/components/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/libs/cn";

import { useComponentMetadata } from "~/hooks/use-component-metadata";
import { useHookMetadata } from "~/hooks/use-hook-metadata";

export function DashboardSidebarContent({
  className,
  setIsMobileOpen,
  isCollapsed = false,
}: {
  className?: string;
  setIsMobileOpen?: (open: boolean) => void;
  isCollapsed?: boolean;
}) {
  const location = useLocation();
  const { components } = useComponentMetadata();
  const { hooks } = useHookMetadata();

  // Group components by parentCategory (e.g. "Shadcn")
  const componentCategories = components.reduce(
    (acc, c) => {
      const category = c.parentCategory || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(c);
      return acc;
    },
    {} as Record<string, typeof components>,
  );

  // State to manage open/closed groups independently
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    () => {
      // Initialize functionality: auto-open based on current matching URL
      const initialOpen: Record<string, boolean> = {};
      // Check Components
      const isComponentsActive =
        components.some((c) => location.pathname === `/components/${c.id}`) ||
        location.pathname === "/components";
      if (isComponentsActive) initialOpen.Components = true;

      // Check Hooks
      const isHooksActive = location.pathname.startsWith("/hooks");
      if (isHooksActive) initialOpen.Hooks = true; // Maps to empty label group if needed, but we used key index.
      // Actually our keys are titles like "Components". For Hooks with empty label, title is still "Hooks" in items.

      return initialOpen;
    },
  );

  const toggleGroup = (title: string, isOpen: boolean) => {
    setOpenGroups((prev) => ({ ...prev, [title]: isOpen }));
  };

  const navGroups = [
    {
      label: "Components",
      items: Object.entries(componentCategories)
        .sort()
        .map(([category, items]) => ({
          title: category,
          url: "/components",
          icon: SquareTerminal,
          // Removed manual isActive property, handled via state
          items: items
            .map((c) => ({
              title: c.name,
              url: `/components/${c.id}`,
            }))
            .sort((a, b) => a.title.localeCompare(b.title)),
        })),
    },
    {
      label: "Custom",
      items: [
        {
          title: "Hooks",
          url: "/hooks",
          icon: Code2,
          // Removed manual isActive property, handled via state
          items: hooks
            .map((h) => ({
              title: h.name,
              url: `/hooks/${h.id}`,
            }))
            .sort((a, b) => a.title.localeCompare(b.title)),
        },
      ],
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <div
        data-collapsed={isCollapsed}
        className={cn(
          "group flex h-full w-full flex-col overflow-hidden bg-gray-50/40 dark:bg-gray-900/40",
          className,
        )}
      >
        {/* Header / Brand */}
        <div
          className={cn(
            "flex h-14 items-center border-b px-4 lg:h-[60px]",
            isCollapsed ? "justify-center px-2" : "lg:px-6",
          )}
        >
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
              <Bot className="size-5 text-white" />
            </div>
            {!isCollapsed && <span className="">Documents</span>}
          </Link>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className={cn("flex-1 py-3", isCollapsed ? "px-2" : "px-3")}>
            <nav className="space-y-6">
              {navGroups.map((group, index) => (
                <div key={index}>
                  {!isCollapsed && group.label && (
                    <div className="mb-2 px-2 text-sm font-semibold tracking-tight text-gray-500 uppercase dark:text-gray-400">
                      {group.label}
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <div key={item.title}>
                        {isCollapsed ? (
                          // Collapsed Icon-Only Mode (Top Level Only)
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.url}
                                className="mx-auto flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                              >
                                <item.icon className="size-4" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="flex items-center gap-4"
                            >
                              {item.title} (Group)
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          // Expanded Mode (Collapsible)
                          <Collapsible
                            open={openGroups[item.title] || false}
                            onOpenChange={(open) =>
                              toggleGroup(item.title, open)
                            }
                            className="group/collapsible"
                          >
                            <div className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                              <Link
                                to={item.url}
                                className="flex flex-1 items-center gap-2 text-[15px] font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                              >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                              </Link>
                              <CollapsibleTrigger asChild>
                                <button className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                                  <ChevronRight className="h-4 w-4 text-gray-500 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                                </button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                              <div className="mt-1 space-y-1 px-2">
                                {item.items.map((subItem) => {
                                  const isActive =
                                    location.pathname === subItem.url;
                                  return (
                                    <Link
                                      key={subItem.title}
                                      to={subItem.url}
                                      onClick={() => setIsMobileOpen?.(false)}
                                      className={cn(
                                        "block rounded-md px-2 py-1.5 text-[15px] transition-colors",
                                        isActive
                                          ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-50",
                                      )}
                                    >
                                      {subItem.title}
                                    </Link>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

export default function DashboardSidebarMobile() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetTrigger asChild>
        <button
          className="fixed right-4 bottom-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-lg md:hidden dark:bg-gray-900"
          aria-label="Toggle Menu"
        >
          <SquareTerminal className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <DashboardSidebarContent setIsMobileOpen={setIsMobileOpen} />
      </SheetContent>
    </Sheet>
  );
}
