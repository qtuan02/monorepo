import { MenuIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@monorepo/ui/components/sheet";
import { cn } from "@monorepo/ui/utils/cn";

import NavActions, { roundControlClassName } from "./nav-actions";
import NavLinks from "./nav-links";

/**
 * Below `md` the pill has no room for the three sections or the four
 * controls, so a menu button opens them in a sheet. The sheet's body only
 * mounts while it is open, which is what keeps the two copies of
 * `NavActions` from both being in the DOM at once.
 */
export default function MobileMenu() {
  const { t } = useTranslation();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("documents.nav.menu")}
            className={cn(roundControlClassName, "md:hidden")}
          />
        }
      >
        <MenuIcon className="size-4.5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72 gap-6 p-6">
        <SheetHeader className="p-0">
          <SheetTitle>{t("documents.meta.brand")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("documents.nav.menu")}
          </SheetDescription>
        </SheetHeader>
        <NavLinks layout="sheet" />
        <NavActions layout="sheet" />
      </SheetContent>
    </Sheet>
  );
}
