import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@monorepo/ui/components/avatar";
import { Button } from "@monorepo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@monorepo/ui/components/dropdown-menu";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { ROUTES } from "~/constants/routes";
import { useCurrentUserQuery } from "~/hooks/api/user";
import { useSignOut } from "~/hooks/use-sign-out";
import { getDisplayName, getInitials } from "~/utils/display";

/**
 * The sidebar current-user area — a `DropdownMenuTrigger render=` around the
 * trigger button, and every item `onClick` rather than Radix's `onSelect`
 * (Base UI's Menu.Item has no `onSelect`). "View profile" navigates to the
 * profile screen, which has its own "Edit profile" button (see
 * profile-form.tsx) — no separate edit entry here.
 *
 * `compact` is the Rail's own trigger (brief §3.1 — "avatar (mở
 * CurrentUserMenu hiện có)"): the same dropdown, opened from a bare avatar
 * rather than the name+chevron button a 64px-wide rail has no room for.
 */
interface CurrentUserMenuProps {
  compact?: boolean;
}

export function CurrentUserMenu({ compact = false }: CurrentUserMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUserQuery();
  const signOut = useSignOut();

  if (isLoading) {
    return (
      <Skeleton
        className={compact ? "size-9 rounded-full" : "h-9 w-40 rounded-md"}
      />
    );
  }

  if (!currentUser) return null;

  const displayName = getDisplayName(currentUser);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            aria-label={compact ? displayName : undefined}
            className={
              compact
                ? "size-9 rounded-full p-0"
                : "h-auto gap-2 rounded-full px-2 py-1"
            }
          >
            <Avatar className="size-8">
              {currentUser.avatarUrl && (
                <AvatarImage src={currentUser.avatarUrl} alt="" />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            {!compact && (
              <>
                <span className="max-w-32 truncate text-sm font-medium">
                  {displayName}
                </span>
                <ChevronsUpDown className="text-muted-foreground size-3.5" />
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
          <UserRound className="mr-2 size-4" />
          {t("chat.profile.menu.viewProfile")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={signOut.isPending}
          onClick={() => signOut.mutate()}
        >
          <LogOut className="mr-2 size-4" />
          {signOut.isPending
            ? t("chat.profile.signingOut")
            : t("chat.profile.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
