import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Building2, FileText, ReceiptText, Search, Users } from "lucide-react";
import { useNavigate } from "react-router";

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

import { ROUTES } from "~/constants/routes";
import { useGetContracts } from "~/hooks/api/contract";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useGetRooms } from "~/hooks/api/room";
import { useGetTenants } from "~/hooks/api/tenant";
import { useBuildingStore } from "~/stores/use-building-store";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: LucideIcon;
  to: string;
}

const quickLinks: { label: string; icon: LucideIcon; to: string }[] = [
  { label: "Phòng", icon: Building2, to: ROUTES.ROOMS },
  { label: "Người thuê", icon: Users, to: ROUTES.TENANTS },
  { label: "Hợp đồng", icon: FileText, to: ROUTES.CONTRACTS },
  { label: "Hoá đơn", icon: ReceiptText, to: ROUTES.INVOICES },
];

function matches(query: string, ...fields: (string | null)[]): boolean {
  const needle = query.toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

interface SearchResultsProps {
  query: string;
  onSelect: (to: string) => void;
}

/**
 * The palette's own data, mounted only while the dialog is open — this is
 * what makes the four list reads fetch-on-mount rather than on every
 * keystroke of the header that owns the dialog (`patterns-fetch-on-mount`).
 * Scoped to the current Building, like every other list read (spec #153
 * §10 row 4 — the palette was one of the seven pha-1 screens that forgot).
 */
function SearchResults({ query, onSelect }: SearchResultsProps) {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const params = { buildingId: selectedBuildingId };
  const { data: rooms = [] } = useGetRooms(params);
  const { data: tenants = [] } = useGetTenants(params);
  const { data: contracts = [] } = useGetContracts(params);
  const { data: invoices = [] } = useGetInvoices(params);

  if (!query) {
    return (
      <CommandGroup heading="Truy cập nhanh">
        {quickLinks.map((link) => (
          <CommandItem
            key={link.label}
            value={link.label}
            onSelect={() => onSelect(link.to)}
          >
            <span className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-md">
              <link.icon className="text-primary size-3.5" />
            </span>
            {link.label}
          </CommandItem>
        ))}
      </CommandGroup>
    );
  }

  const results: SearchResult[] = [
    ...rooms
      .filter((room) => matches(query, room.name, room.tenant))
      .map((room) => ({
        id: room.id,
        title: room.name,
        subtitle: room.tenant
          ? `${room.tenant} · Tầng ${room.floor}`
          : "Phòng trống",
        category: "Phòng",
        icon: Building2,
        to: ROUTES.roomDetailPath(room.id),
      })),
    ...tenants
      .filter((tenant) =>
        matches(query, tenant.name, tenant.phone, tenant.room),
      )
      .map((tenant) => ({
        id: tenant.id,
        title: tenant.name,
        subtitle: `${tenant.room} · ${tenant.phone}`,
        category: "Người thuê",
        icon: Users,
        to: ROUTES.tenantDetailPath(tenant.id),
      })),
    ...contracts
      .filter((contract) =>
        matches(query, contract.contractNumber, contract.tenant, contract.room),
      )
      .map((contract) => ({
        id: contract.id,
        title: `Hợp đồng ${contract.contractNumber}`,
        subtitle: `${contract.tenant} · ${contract.room}`,
        category: "Hợp đồng",
        icon: FileText,
        to: ROUTES.contractDetailPath(contract.id),
      })),
    ...invoices
      .filter((invoice) =>
        matches(query, invoice.invoiceNumber, invoice.tenant, invoice.room),
      )
      .map((invoice) => ({
        id: invoice.id,
        title: `Hoá đơn ${invoice.invoiceNumber}`,
        subtitle: `${invoice.tenant} · ${invoice.room} · kỳ ${invoice.month}`,
        category: "Hoá đơn",
        icon: ReceiptText,
        to: ROUTES.invoiceDetailPath(invoice.id),
      })),
  ];

  if (results.length === 0) {
    return (
      <CommandEmpty>
        <p className="font-medium">Không tìm thấy kết quả</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Thử tìm kiếm với từ khóa khác
        </p>
      </CommandEmpty>
    );
  }

  const resultsByCategory = new Map<string, SearchResult[]>();
  for (const result of results) {
    const group = resultsByCategory.get(result.category) ?? [];
    group.push(result);
    resultsByCategory.set(result.category, group);
  }

  return (
    <>
      {[...resultsByCategory].map(([category, group]) => (
        <CommandGroup key={category} heading={category}>
          {group.map((result) => (
            <CommandItem
              key={result.id}
              value={`${result.title} ${result.subtitle} ${result.category}`}
              onSelect={() => onSelect(result.to)}
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
  );
}

/**
 * The header's command palette (`command` primitive, so ↑↓/↵/Esc come for
 * free): quick links on an empty query, real Phòng/Người thuê/Hợp đồng/Hoá
 * đơn on the Mock once one is typed (spec #153 §10 — "tìm nhanh ⌘K tìm ...
 * trên Mock thật"). ⌘K / Ctrl+K opens it, as the trigger promises.
 */
export default function SearchDialog() {
  const navigate = useNavigate();
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

  const handleSelect = (to: string) => {
    handleOpenChange(false);
    navigate(to);
  };

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
        description="Tìm phòng, Người thuê, hợp đồng, hoá đơn"
        className="sm:max-w-xl"
      >
        {/* CommandDialog is only the Dialog: the cmdk root, and everything
            inside it, is ours to mount — and only exists while `open` is
            true, since Base UI's Dialog unmounts its Popup when closed. */}
        {open && (
          <Command>
            <CommandInput
              placeholder="Tìm kiếm phòng, Người thuê, hợp đồng..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-95">
              <SearchResults query={query} onSelect={handleSelect} />
            </CommandList>
          </Command>
        )}
        <div className="text-muted-foreground bg-muted/40 flex items-center gap-4 border-t px-4 py-2 text-xs">
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
