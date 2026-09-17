import { Calendar, Home, Phone } from "lucide-react";

import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { TenantView } from "~/types/tenant";
import { TenantAvatar } from "~/components/avatar/tenant-avatar";
import { StatusBadge } from "~/components/badge/status-badge";
import { facetFilterFn } from "~/components/data-table/data-table";
import {
  tenantOverdueInvoiceConfig,
  tenantStatusConfig,
} from "~/constants/status";
import TenantRowActions from "./tenant-row-actions";

const helper = createDataTableColumnHelper<TenantView>();

/** The Người thuê table: `name` carries the search, `status` the facet. */
export const tenantColumns = helper.columns([
  helper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người thuê" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <TenantAvatar tenant={row.original} className="size-8 text-xs" />
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Phone className="size-3" /> {row.original.phone}
          </span>
        </div>
      </div>
    ),
    filterFn: "includesString",
  }),
  helper.accessor("room", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phòng" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Home className="text-muted-foreground size-4" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.original.room}</span>
          <span className="text-muted-foreground text-[10px]">
            Tầng {row.original.floor}
          </span>
        </div>
      </div>
    ),
  }),
  helper.accessor("moveInDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày vào" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground flex items-center gap-2 text-sm">
        <Calendar className="size-4" />
        {getValue()}
      </span>
    ),
  }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <StatusBadge config={tenantStatusConfig[row.original.status]} />
        {row.original.hasOverdueInvoice && (
          <StatusBadge config={tenantOverdueInvoiceConfig} isCompact />
        )}
      </div>
    ),
    filterFn: facetFilterFn,
  }),
  helper.display({
    id: "actions",
    cell: ({ row }) => <TenantRowActions tenant={row.original} />,
  }),
]);
