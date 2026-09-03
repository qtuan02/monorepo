import * as React from "react";
import { Bot, ChevronRight, Code2, SquareTerminal } from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@monorepo/ui/components/collapsible";
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

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      const onComponentsSection =
        components.some((c) => location.pathname === `/components/${c.id}`) ||
        location.pathname === "/components";
      if (onComponentsSection) initial.Components = true;
      if (location.pathname.startsWith("/hooks")) initial.Hooks = true;
      return initial;
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
          "group bg-background flex h-full w-full flex-col overflow-hidden",
          className,
        )}
      >
        <div
          className={cn(
            "border-border flex h-14 items-center border-b px-4 lg:h-[60px]",
            isCollapsed ? "justify-center px-2" : "lg:px-6",
          )}
        >
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
              <Bot className="size-5" />
            </div>
            {!isCollapsed && <span className="text-foreground">Documents</span>}
          </Link>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className={cn("flex-1 py-3", isCollapsed ? "px-2" : "px-3")}>
            <nav className="space-y-6">
              {navGroups.map((group, index) => (
                <div key={index}>
                  {!isCollapsed && group.label && (
                    <div className="text-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
                      {group.label}
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <div key={item.title}>
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.url}
                                className="text-muted-foreground hover:bg-muted mx-auto flex h-9 w-9 items-center justify-center rounded-md"
                              >
                                <item.icon className="size-4" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="bg-primary text-primary-foreground flex items-center gap-4"
                            >
                              {item.title} (Group)
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Collapsible
                            open={openGroups[item.title] || false}
                            onOpenChange={(open) =>
                              toggleGroup(item.title, open)
                            }
                            className="group/collapsible"
                          >
                            <div className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors">
                              <Link
                                to={item.url}
                                className="text-foreground/90 hover:text-foreground flex flex-1 items-center gap-2 text-[15px] font-medium"
                              >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                              </Link>
                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="hover:bg-accent flex h-6 w-6 items-center justify-center rounded-md"
                                >
                                  <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                                </button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                              <div className="border-border mt-1 ml-4 space-y-1 border-l px-2">
                                {item.items.map((subItem) => {
                                  const isActive =
                                    location.pathname === subItem.url;
                                  return (
                                    <Link
                                      key={subItem.title}
                                      to={subItem.url}
                                      onClick={() => setIsMobileOpen?.(false)}
                                      className={cn(
                                        "block rounded-md px-2 py-1.5 text-sm transition-colors",
                                        isActive
                                          ? "bg-muted text-foreground font-medium"
                                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
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
          type="button"
          className="border-border bg-background fixed right-4 bottom-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg md:hidden"
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
