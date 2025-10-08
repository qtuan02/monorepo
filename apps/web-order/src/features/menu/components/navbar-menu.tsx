import { Button } from "@web/web-ui/shadcn-ui/button";
import { Input } from "@web/web-ui/shadcn-ui/input";
import { ArrowLeft, Search, ShoppingCart } from "lucide-react";

function SearchMenu() {
  return (
    <div className="flex-1 relative">
      <Search className="size-5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
      <Input placeholder="Tìm kiếm..." className="h-10 pl-8 leading-10" />
    </div>
  );
}

export default function NavbarMenu() {
  return (
    <section className="h-15 bg-white flex items-center p-2 gap-x-2 w-full">
      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer text-orange-500 hover:text-orange-600 hover:bg-orange-50"
      >
        <ArrowLeft className="size-6.5" />
      </Button>

      <SearchMenu />

      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer text-orange-500 hover:text-orange-600 hover:bg-orange-50"
      >
        <ShoppingCart className="size-6.5" />
      </Button>
    </section>
  );
}
