import type { Meta, StoryObj } from "@storybook/react";
import {
  CalendarIcon,
  HomeIcon,
  InboxIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@monorepo/ui/components/sidebar";

const meta = {
  title: "Storybook/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

const items = [
  { title: "Home", icon: HomeIcon },
  { title: "Inbox", icon: InboxIcon },
  { title: "Calendar", icon: CalendarIcon },
  { title: "Search", icon: SearchIcon },
  { title: "Settings", icon: SettingsIcon },
];

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "A real sidebar is `fixed inset-y-0 h-svh` — it owns the full viewport height. `contain: paint` on the wrapper makes that wrapper the containing block for the fixed panel, so the story stays inside its own box instead of overlaying the Docs page.",
      },
    },
  },
  render: () => (
    // `[contain:paint]` is what confines the fixed panel; without it the sidebar
    // anchors to the viewport and the Docs page grows a scrollbar around it.
    <div className="relative h-[28rem] w-full overflow-hidden [contain:paint]">
      <SidebarProvider className="min-h-full">
        <Sidebar>
          <SidebarHeader>
            <span className="px-2 text-sm font-semibold">Monorepo</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={item.title === "Home"}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <span className="px-2 text-xs text-muted-foreground">v1.0.0</span>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <span className="text-sm font-medium">Dashboard</span>
          </header>
          <div className="p-6 text-sm text-muted-foreground">
            Page content goes here.
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  ),
};
