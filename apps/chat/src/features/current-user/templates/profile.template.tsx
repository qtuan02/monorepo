import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useIsMobile } from "@monorepo/hook/use-is-mobile";
import { Button } from "@monorepo/ui/components/button";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { ProfileForm } from "~/features/current-user/components/profile-form";
import ThemeToggleButton from "~/features/layout/components/theme-toggle-button";
import { useCurrentUserQuery } from "~/hooks/api/user";
import { useSignOut } from "~/hooks/use-sign-out";

// Named rows rather than an index key — see conversation-list.skeleton.tsx.
const SKELETON_FIELDS = ["first", "last", "username", "email", "phone"];

export default function ProfileTemplate() {
  const { t } = useTranslation();
  const currentUserQuery = useCurrentUserQuery();
  const isMobile = useIsMobile();
  const signOut = useSignOut();

  if (currentUserQuery.isLoading) {
    return (
      <div className="flex flex-col">
        <Skeleton className="h-28 shrink-0 rounded-none md:h-36" />
        <div className="flex flex-col gap-6 px-4 pb-6 md:px-8">
          <div className="-mt-12 flex items-end gap-4 md:-mt-14">
            <Skeleton className="ring-card size-24 rounded-full ring-4 md:size-28" />
            <div className="grid flex-1 gap-2 pb-1">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            {SKELETON_FIELDS.map((field) => (
              <Skeleton key={`profile-field-${field}`} className="h-15" />
            ))}
            <Skeleton className="h-30 md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  const currentUser = currentUserQuery.data;
  if (!currentUser) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">
          {t("chat.profile.loadError")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ProfileForm profile={currentUser} />

      {/* Only on mobile — the Bottom nav's "Me" tab has no menu to fall
          back on, so this row is what makes it self-sufficient; on
          desktop both already live in the Rail's current-user menu. */}
      {isMobile && (
        <div className="border-border mx-4 mb-6 grid gap-1 border-t pt-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium">
              {t("chat.profile.appearance")}
            </span>
            <ThemeToggleButton />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
            className="text-destructive hover:text-destructive h-11 justify-start gap-2"
          >
            <LogOut className="size-4" />
            {signOut.isPending
              ? t("chat.profile.signingOut")
              : t("chat.profile.signOut")}
          </Button>
        </div>
      )}
    </div>
  );
}
