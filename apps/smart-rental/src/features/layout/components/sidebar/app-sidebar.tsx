import { FileText } from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@monorepo/ui/components/sidebar";

import { ROUTES } from "~/constants/routes";
import {
  dashboardItem,
  navigationSections,
} from "~/features/layout/constants/navigation";
import {
  isNavigationItemActive,
  resolveNavigationItemTo,
} from "~/features/layout/utils/navigation";
import NavUser from "./nav-user";

/**
 * The Portal's sidebar: brand, the 15 areas in three groups, the landlord's
 * menu. `collapsible="icon"` keeps the icons when collapsed; the primitive
 * turns it into a sheet below `md` on its own.
 */
export default function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0 print:hidden">
      <SidebarHeader className="h-15 justify-center border-b px-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2.5 font-semibold group-data-[collapsible=icon]:justify-center"
        >
          <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
            <FileText className="size-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-foreground text-sm font-bold tracking-tight">
              Phòng Trọ
            </span>
            <span className="text-muted-foreground text-xs leading-none">
              Quản lý cho thuê
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isNavigationItemActive(dashboardItem, pathname)}
                  tooltip={dashboardItem.title}
                  render={
                    <Link to={resolveNavigationItemTo(dashboardItem)}>
                      <dashboardItem.icon className="shrink-0" />
                      <span>{dashboardItem.title}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navigationSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-foreground/60 text-xs font-semibold tracking-wider uppercase">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.match}>
                    <SidebarMenuButton
                      isActive={isNavigationItemActive(item, pathname)}
                      tooltip={item.title}
                      render={
                        <Link to={resolveNavigationItemTo(item)}>
                          <item.icon className="shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
