"use client";

import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BarChart3Icon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button, Separator } from "@monorepo/ui";

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
} from "~/features/layout/components/sidebar";
import { Link, usePathname } from "~/i18n/navigation";
import { authClient } from "~/libs/auth-client";

interface MenuItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
}

interface MenuGroup {
  titleKey: string;
  items: MenuItem[];
}

const menuItems: MenuGroup[] = [
  {
    titleKey: "main",
    items: [
      {
        titleKey: "dashboard",
        href: "/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        titleKey: "home",
        href: "/",
        icon: HomeIcon,
      },
    ],
  },
  {
    titleKey: "analytics",
    items: [
      {
        titleKey: "reports",
        href: "/dashboard/reports",
        icon: BarChart3Icon,
      },
      {
        titleKey: "users",
        href: "/dashboard/users",
        icon: UsersIcon,
      },
    ],
  },
  {
    titleKey: "settings",
    items: [
      {
        titleKey: "settings",
        href: "/dashboard/settings",
        icon: SettingsIcon,
      },
    ],
  },
];

export function DashboardSidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success(t("sign_out") || "Signed out successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign out",
      );
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <LayoutDashboardIcon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{t("dashboard")}</span>
            <span className="text-sidebar-foreground/70 truncate text-xs">
              {t("admin_panel")}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.titleKey}>
            <SidebarGroupLabel>{t(group.titleKey)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const title = t(item.titleKey);
                  return (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={title}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {session?.user && (
        <SidebarFooter>
          <Separator className="mb-2" />
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1 px-2">
              <p className="text-sidebar-foreground truncate text-sm font-medium">
                {session.user.name || "User"}
              </p>
              <p className="text-sidebar-foreground/70 truncate text-xs">
                {session.user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOutIcon className="mr-2 size-4" />
              <span>{t("sign_out")}</span>
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
