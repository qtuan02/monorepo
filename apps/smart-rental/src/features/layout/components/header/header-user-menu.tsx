import { LogOut, Settings } from "lucide-react";
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

import { ROUTES } from "~/constants/routes";
import { initialsOf } from "~/features/layout/components/sidebar/nav-user";
import { useAuthStore } from "~/stores/use-auth-store";

/**
 * The desktop header's own account menu (ADR-0011, spec #153 §3.1) — the
 * sidebar's `NavUser` still owns the same menu for the sheet/collapsed
 * sidebar, and the two share `initialsOf` rather than a second formula.
 * Hidden below `md`: the mobile header carries no avatar (§10 row 22).
 */
export default function HeaderUserMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const name = user?.name ?? "";

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH_LOGIN);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Menu tài khoản"
            className="hover:bg-accent rounded-lg p-0.5 transition-colors"
          >
            <Avatar className="border-border size-8 rounded-lg border">
              <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                {initialsOf(name)}
              </AvatarFallback>
            </Avatar>
          </button>
        }
      />
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{name}</DropdownMenuLabel>
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
  );
}
