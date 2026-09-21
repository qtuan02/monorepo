import * as React from "react";
import { KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@monorepo/ui/components/dialog";

import { ChangePasswordForm } from "~/features/current-user/components/change-password-form";

/** The trigger sits next to `ProfileForm`'s "Edit profile" button; the form
 * itself is unchanged, just moved from an always-open section into here. */
export function ChangePasswordDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline">
            <KeyRound className="size-4" />
            {t("chat.profile.changePassword.title")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("chat.profile.changePassword.title")}</DialogTitle>
        </DialogHeader>
        <ChangePasswordForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
