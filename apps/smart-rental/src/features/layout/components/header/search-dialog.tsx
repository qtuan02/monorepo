import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Building2, FileText, ReceiptText, Search, Users } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@monorepo/ui/components/command";
import { Kbd } from "@monorepo/ui/components/kbd";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: LucideIcon;
}

// The prototype's sample results — the palette searches nothing real yet.
const sampleResults: SearchResult[] = [
  {
    id: "1",
    title: "Phòng 101 – Tòa A",
    subtitle: "Đang thuê • Nguyễn Văn An",
    category: "Phòng trọ",
    icon: Building2,
  },
  {
    id: "2",
    title: "Nguyễn Thị Bình",
    subtitle: "Khách thuê • Phòng 205",
    category: "Khách thuê",
    icon: Users,
  },
  {
    id: "3",
    title: "Hợp đồng #HĐ-2024-089",
    subtitle: "Còn hiệu lực • Hết hạn 30/06/2025",
    category: "Hợp đồng",
    icon: FileText,
  },
  {
    id: "4",
    title: "Hóa đơn tháng 4 – Phòng 302",
    subtitle: "Chưa thanh toán • 2,500,000 đ",
    category: "Hóa đơn",
    icon: ReceiptText,
  },
  {
    id: "5",
    title: "Tòa nhà Sunrise",
    subtitle: "45/48 phòng • Đường Lê Lợi, Q.1",
    category: "Tòa nhà",
    icon: Building2,
  },
];

const quickLinks: { label: string; icon: LucideIcon }[] = [
  { label: "Phòng trọ", icon: Building2 },
  { label: "Khách thuê", icon: Users },
  { label: "Hợp đồng", icon: FileText },
  { label: "Hóa đơn", icon: ReceiptText },
];

// Results grouped by category, in first-seen order — the prototype's shape.
const resultsByCategory = new Map<string, SearchResult[]>();
for (const result of sampleResults) {
  const group = resultsByCategory.get(result.category) ?? [];
  group.push(result);
  resultsByCategory.set(result.category, group);
}

/**
 * The header's command palette (`command` primitive, so ↑↓/↵/Esc come for
 * free): quick links on an empty query, sample results grouped by category
 * once there is one. ⌘K / Ctrl+K opens it, as the trigger promises.
 */
export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };
  const close = () => handleOpenChange(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground relative hidden w-56 justify-start shadow-none lg:flex lg:w-64"
      >
        <Search />
        Tìm kiếm...
        <Kbd className="absolute top-1.5 right-1.5">⌘K</Kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Tìm kiếm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground lg:hidden"
      >
        <Search />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Tìm kiếm"
        description="Tìm phòng, khách thuê, hợp đồng, hóa đơn"
        className="sm:max-w-xl"
      >
        {/* CommandDialog is only the Dialog: the cmdk root is ours to mount. */}
        <Command>
          <CommandInput
            placeholder="Tìm kiếm phòng, khách thuê, hợp đồng..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[380px]">
            {query ? (
              <>
                <CommandEmpty>
                  <p className="font-medium">Không tìm thấy kết quả</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                </CommandEmpty>
                {[...resultsByCategory].map(([category, results]) => (
                  <CommandGroup key={category} heading={category}>
                    {results.map((result) => (
                      <CommandItem
                        key={result.id}
                        value={`${result.title} ${result.subtitle} ${result.category}`}
                        onSelect={close}
                      >
                        <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
                          <result.icon className="text-muted-foreground size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {result.title}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {result.subtitle}
                          </span>
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            ) : (
              <CommandGroup heading="Truy cập nhanh">
                {quickLinks.map((link) => (
                  <CommandItem
                    key={link.label}
                    value={link.label}
                    onSelect={close}
                  >
                    <span className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-md">
                      <link.icon className="text-primary size-3.5" />
                    </span>
                    {link.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <div className="text-muted-foreground bg-muted/40 flex items-center gap-4 border-t px-4 py-2 text-[11px]">
          <span className="flex items-center gap-1">
            <Kbd>↑↓</Kbd> di chuyển
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd> chọn
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Esc</Kbd> đóng
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
