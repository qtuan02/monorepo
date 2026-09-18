import { LogOut, MoreHorizontal } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";

import { Avatar, AvatarFallback } from "@monorepo/ui/components/avatar";
import { buttonVariants } from "@monorepo/ui/components/button";
import { Separator } from "@monorepo/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@monorepo/ui/components/sheet";
import { cn } from "@monorepo/ui/utils/cn";

import { ROUTES } from "~/constants/routes";
import { initialsOf } from "~/features/layout/components/sidebar/nav-user";
import {
  bottomNavItems,
  moreNavSections,
} from "~/features/layout/constants/navigation";
import { isNavigationItemActive } from "~/features/layout/utils/navigation";
import { useAuthStore } from "~/stores/use-auth-store";

/**
 * The mobile substitute for the sidebar (spec #179 §"IA / shell"): four
 * fixed stops plus "Thêm", a Sheet over the nine remaining areas grouped as
 * the sidebar groups them — with the account row `NavUser` owns on desktop
 * repeated on top (the sidebar itself, and its `NavUser` footer, never
 * render below `md`) and "Đăng xuất" tách riêng dưới cùng. `md:hidden` — the
 * sidebar (and its trigger in `AppHeader`) takes over from `md` up.
 */
export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const name = user?.name ?? "";

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH_LOGIN);
  };

  return (
    <nav
      aria-label="Điều hướng chính"
      className="border-border bg-background fixed inset-x-0 bottom-0 z-20 flex h-16 items-stretch border-t md:hidden print:hidden"
    >
      {bottomNavItems.map((item) => {
        const active = isNavigationItemActive(item, pathname);
        return (
          <Link
            key={item.path}
            to={item.to ?? item.path}
            data-active={active || undefined}
            className={cn(
              "text-muted-foreground flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium",
              active && "text-primary",
            )}
          >
            <item.icon className="size-5" />
            {item.title}
          </Link>
        );
      })}

      <Sheet>
        <SheetTrigger className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium">
          <MoreHorizontal className="size-5" />
          Thêm
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Thêm</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 px-4 pb-6">
            <div className="flex items-center gap-3">
              <Avatar className="border-border size-9 rounded-lg border">
                <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                  {initialsOf(name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </p>
              </div>
              <Link
                to={ROUTES.SETTINGS}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Hồ sơ
              </Link>
            </div>

            {moreNavSections.map((section) => (
              <div key={section.label}>
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  {section.label}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.to ?? item.path}
                      className="border-border flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center text-xs font-medium"
                    >
                      <item.icon className="text-muted-foreground size-5" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <Separator />

            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-destructive hover:text-destructive w-full justify-start",
              )}
            >
              <LogOut />
              Đăng xuất
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
