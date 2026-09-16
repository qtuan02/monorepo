import { LogIn, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@monorepo/ui/components/alert-dialog";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

import { ROUTES } from "~/constants/routes";
import { useAuthStore } from "~/stores/use-auth-store";

// The header's own ghost styling: the primitive's `hover:bg-accent` is a light
// wash meant for a light surface, which washes out on the primary bar.
const iconButtonClassName =
  "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground";

/**
 * Signing out is destructive and one click away in the header, so it asks first.
 * `AlertDialog` (not `Dialog`) is the right primitive: it traps focus on the
 * confirm action and cannot be dismissed by an accidental outside click.
 */
function SignOutControl() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const label = t("auth.signOut");

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger
          render={
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  // The icon carries no text, so this label is what both the
                  // screen reader and the tooltip read.
                  aria-label={label}
                  className={iconButtonClassName}
                >
                  <LogOut className="size-4.5" />
                </Button>
              }
            />
          }
        />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <LogOut />
          </AlertDialogMedia>
          <AlertDialogTitle>{t("auth.signOutConfirm.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("auth.signOutConfirm.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t("auth.signOutConfirm.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={logout}>
            {t("auth.signOutConfirm.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SignInControl() {
  const { t } = useTranslation();
  const label = t("auth.signIn.submit");

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          // A <Link> styled with `buttonVariants`, not wrapped in `Button`:
          // Base UI's Button assumes a native <button>, and telling it
          // otherwise (`nativeButton={false}`) stamps role="button" over the
          // anchor's own link role. This control navigates, so it stays a link.
          <Link
            to={ROUTES.SIGN_IN}
            aria-label={label}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              iconButtonClassName,
            )}
          >
            <LogIn className="size-4.5" />
          </Link>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The only piece of the header that reads the auth token, so a sign-in or a
 * sign-out re-renders this button instead of the whole bar.
 */
export default function HeaderAuthButton() {
  // One narrow selector — selecting the whole store would re-render on any
  // unrelated field change.
  const token = useAuthStore((s) => s.token);

  return token ? <SignOutControl /> : <SignInControl />;
}
