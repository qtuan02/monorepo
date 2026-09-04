import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import { toast } from "@monorepo/ui/components/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";

/**
 * A placeholder until there is a notification feed to open: it demonstrates the
 * global `Toaster` wiring, and gives the header the slot the real control takes.
 */
export default function HeaderNotificationButton() {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            // The icon carries no text, so the label is what a screen reader
            // and the tooltip both read.
            aria-label={t("header.notification")}
            className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground relative"
            onClick={() =>
              toast.add({
                title: t("header.notification"),
                description: t("header.notificationDescription"),
                type: "success",
              })
            }
          >
            <Bell className="size-4.5" />
            {/* Unread dot — ringed in the header's own colour so it reads as a
                badge sitting on the bell rather than a stray pixel. */}
            <span
              aria-hidden="true"
              className="bg-destructive ring-primary absolute top-1.5 right-1.5 size-2 rounded-full ring-2"
            />
          </Button>
        }
      />
      <TooltipContent>{t("header.notification")}</TooltipContent>
    </Tooltip>
  );
}
