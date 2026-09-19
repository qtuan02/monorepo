import * as React from "react";
import { LogOut, PencilLine } from "lucide-react";

import { useIsMobile } from "@monorepo/hook/use-is-mobile";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@monorepo/ui/components/avatar";
import { Button } from "@monorepo/ui/components/button";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { useSignOut } from "~/features/auth/hooks/use-sign-out";
import { ProfileEditDialog } from "~/features/current-user/components/profile-edit-dialog";
import ThemeToggleButton from "~/features/layout/components/theme-toggle-button";
import { useCurrentUserQuery } from "~/hooks/api/user";
import { getDisplayName } from "~/utils/display";

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm">{value || "Not provided"}</p>
    </div>
  );
}

export default function ProfileTemplate() {
  const currentUserQuery = useCurrentUserQuery();
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const signOut = useSignOut();

  if (currentUserQuery.isLoading) {
    return (
      <div className="mx-auto grid w-full max-w-lg gap-4 p-4 md:p-6">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const currentUser = currentUserQuery.data;
  if (!currentUser) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">
          Unable to load your profile.
        </p>
      </div>
    );
  }

  const displayName = getDisplayName(currentUser);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto grid w-full max-w-lg gap-4 p-4 md:p-6">
        <h1 className="text-xl font-semibold">Profile</h1>

        <div className="border-border flex items-center justify-between gap-3 rounded-xl border p-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12">
              {currentUser.avatarUrl && (
                <AvatarImage src={currentUser.avatarUrl} alt="" />
              )}
              <AvatarFallback className="text-sm font-semibold">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{displayName}</p>
              <p className="text-muted-foreground truncate text-xs">
                @{currentUser.username}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setIsEditOpen(true)}
            aria-label="Edit profile"
          >
            <PencilLine className="size-4" />
          </Button>
        </div>

        <div className="border-border grid gap-3 rounded-xl border p-3">
          <DetailRow label="Full name" value={displayName} />
          <DetailRow label="Username" value={currentUser.username} />
          <DetailRow label="Email" value={currentUser.email} />
          <DetailRow label="Phone" value={currentUser.phone} />
          <DetailRow label="Bio" value={currentUser.bio} />
        </div>

        {/* Only on mobile — the Bottom nav's "Me" tab has no menu to fall
            back on, so this row is what makes it self-sufficient; on
            desktop both already live in the Rail's current-user menu. */}
        {isMobile && (
          <div className="border-border grid gap-1 rounded-xl border p-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium">Appearance</span>
              <ThemeToggleButton />
            </div>
            <Button
              type="button"
              variant="ghost"
              disabled={signOut.isPending}
              onClick={() => signOut.mutate()}
              className="text-destructive hover:text-destructive h-11 justify-start gap-2"
            >
              <LogOut className="size-4" />
              {signOut.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        )}
      </div>

      <ProfileEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        profile={currentUser}
      />
    </div>
  );
}
