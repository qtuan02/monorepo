import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Avatar, AvatarFallback } from "@monorepo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@monorepo/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@monorepo/ui/components/sidebar";

import { ROUTES } from "~/constants/routes";
import { useAuthStore } from "~/stores/use-auth-store";

/**
 * "Nguyễn Văn An" → "VA": the last two words' initials, as the prototype.
 * Exported so the header's own account menu (`header-user-menu.tsx`) reads
 * the same initials rather than a second copy.
 */
export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .slice(-2)
    .join("")
    .toUpperCase();
}

/**
 * The landlord's menu at the foot of the sidebar. Sign-out clears the store —
 * the guards react on their own — and then navigates so the screen changes
 * now rather than on the next render of a guarded route.
 */
export default function NavUser() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const name = user?.name ?? "";
  const email = user?.email ?? "";

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH_LOGIN);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label="Tài khoản"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              >
                <Avatar className="border-border rounded-lg border shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                    {initialsOf(name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* Base UI needs a Group around a GroupLabel. */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link to={ROUTES.SETTINGS} />}>
                <Settings />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
