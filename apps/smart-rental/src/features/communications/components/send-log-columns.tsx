import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { SendLog } from "~/types/communication";
import { StatusBadge } from "~/components/badge/status-badge";
import { facetFilterFn } from "~/components/data-table/data-table";
import { channelConfig, sendLogStatusConfig } from "~/constants/status";

const helper = createDataTableColumnHelper<SendLog>();

/** The Nhật ký gửi table: `tenant` carries the search, `channel` and `status` the facets. */
export const sendLogColumns = helper.columns([
  helper.accessor("tenant", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người thuê" />
    ),
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    filterFn: "includesString",
  }),
  helper.accessor("template", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mẫu" />
    ),
  }),
  helper.accessor("channel", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kênh" />
    ),
    cell: ({ getValue }) => channelConfig[getValue()].label,
    filterFn: facetFilterFn,
  }),
  helper.accessor("recipient", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người nhận" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ getValue }) => (
      <StatusBadge config={sendLogStatusConfig[getValue()]} />
    ),
    filterFn: facetFilterFn,
  }),
  helper.accessor("sentDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thời gian" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
]);
