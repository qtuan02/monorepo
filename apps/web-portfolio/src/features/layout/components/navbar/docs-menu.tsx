import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@web/web-ui/shadcn-ui/sheet";
import { Menu, X } from "lucide-react";
import AsideDocs from "~/features/docs/components/aside/aside-docs";

const DocsMenu = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex flex-col items-center gap-x-2 w-20">
          <Menu className="size-5" />
          <span className="text-xs">Menu</span>
        </button>
      </SheetTrigger>
      <SheetContent
        isHiddenCloseIcon
        className="border-l-0 bg-white/50 mt-auto gap-0 dark:bg-gray-900/70 backdrop-blur-sm"
      >
        <SheetHeader className="py-2.5 pl-5">
          <SheetTitle className="flex items-center justify-between gap-x-2">
            <span className="text-xl font-medium">MENU</span>
            <SheetClose
              asChild
              className="bg-gray-200 dark:bg-gray-800 rounded-full p-1"
            >
              <X />
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto scrollbar-none">
          <AsideDocs />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DocsMenu;
