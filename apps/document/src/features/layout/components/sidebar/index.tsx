import type * as React from "react";

import type { SideBarGroup } from "~/types/sidebar";
import { NextImage } from "~/components/next-image";
import NextLink from "~/components/next-link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "~/components/sidebar";

interface IRootSidebarProps extends React.ComponentProps<typeof Sidebar> {
  data: SideBarGroup[];
}

export function RootSidebar(props: IRootSidebarProps) {
  const { data, ...rest } = props;

  return (
    <Sidebar {...rest}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <NextImage
                    src="/logo.webp"
                    alt="logo"
                    width={30}
                    height={30}
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Document</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.map((group, index) => (
              <SidebarMenuItem key={`group-sidebar-${index}`}>
                <SidebarMenuButton asChild>
                  <span className="font-medium">{group.title}</span>
                </SidebarMenuButton>

                {!!group.items?.length && (
                  <SidebarMenuSub>
                    {group.items.map((item) => (
                      <SidebarMenuSubItem key={`item-sidebar-${item.key}`}>
                        <SidebarMenuSubButton asChild>
                          <NextLink href={item.href}>{item.label}</NextLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
