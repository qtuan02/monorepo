import { Menu, X } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@monorepo/ui/shadcn-ui/sheet";

import AsideDocs from "~/features/docs/components/aside/aside-docs";

const DocsMenu = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex w-20 flex-col items-center gap-x-2">
          <Menu className="size-5" />
          <span className="text-xs">Menu</span>
        </button>
      </SheetTrigger>
      <SheetContent
        isHiddenCloseIcon
        className="mt-auto gap-0 border-l-0 bg-white/70 backdrop-blur-sm dark:bg-gray-900/70"
      >
        <SheetHeader className="py-2.5 pl-5">
          <SheetTitle className="flex items-center justify-between gap-x-2">
            <span className="text-xl font-medium">MENU</span>
            <SheetClose
              asChild
              className="rounded-full bg-gray-200 p-1 dark:bg-gray-800"
            >
              <X />
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        <div className="scrollbar-none overflow-y-auto">
          <AsideDocs />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DocsMenu;
