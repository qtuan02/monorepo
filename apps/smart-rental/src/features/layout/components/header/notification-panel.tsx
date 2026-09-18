import type { LucideIcon } from "lucide-react";
import { Bell, FileClock, Gauge, ShieldAlert, Wrench } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";
import { ScrollArea } from "@monorepo/ui/components/scroll-area";
import { cn } from "@monorepo/ui/utils/cn";

import type { TaskType } from "~/types/task";
import type { TaskQueueEntry } from "~/utils/task-queue";
import { ROUTES } from "~/constants/routes";
import { useGetBuildings } from "~/hooks/api/building";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useGetTasks } from "~/hooks/api/task";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { taskRelatedPath } from "~/utils/task-due";
import { buildTaskQueueEntries } from "~/utils/task-queue";

const taskTypeIcon: Record<TaskType, LucideIcon> = {
  invoice_overdue: Bell,
  contract_expiring: FileClock,
  maintenance: Wrench,
  utility_anomaly: Gauge,
  residence_notification: ShieldAlert,
  batch_pending: Bell,
};

function NotificationEntry({ entry }: { entry: TaskQueueEntry }) {
  const Icon =
    entry.kind === "overdue-group" ? Bell : taskTypeIcon[entry.task.type];
  const title =
    entry.kind === "overdue-group"
      ? `${entry.invoices.length} Hoá đơn quá hạn`
      : entry.task.title;
  const description =
    entry.kind === "overdue-group"
      ? `${entry.buildingName} · ${formatCurrency(entry.totalOutstanding)}`
      : entry.task.description;
  const firstInvoiceId =
    entry.kind === "overdue-group" ? entry.invoices[0]?.invoiceId : undefined;
  const to =
    entry.kind === "overdue-group"
      ? firstInvoiceId
        ? ROUTES.invoiceDetailPath(firstInvoiceId)
        : ROUTES.INVOICES
      : taskRelatedPath(entry.task);

  return (
    <Link
      to={to}
      className="hover:bg-muted/60 flex w-full gap-3 px-4 py-3.5 text-left transition-colors"
    >
      <div className="bg-muted mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm leading-tight font-medium">
          {title}
        </p>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
          {description}
        </p>
      </div>
    </Link>
  );
}

/**
 * The bell in the header (spec #179 §"Hôm nay" — "chuông giữ, cùng gộp"):
 * the same gộp hàng đợi Hôm nay reads, off the same `useGetTasks` cache, so
 * there is one Việc cần làm queue rather than a second, hand-authored one.
 * There is no read/unread state — a Việc cần làm has no such concept
 * (ADR-0012), so every item shown here is, by construction, still open.
 */
export default function NotificationPanel() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const tasksQuery = useGetTasks({ buildingId: selectedBuildingId });
  const invoicesQuery = useGetInvoices({ buildingId: selectedBuildingId });
  const buildingsQuery = useGetBuildings();
  const entries = buildTaskQueueEntries(
    tasksQuery.data ?? [],
    invoicesQuery.data ?? [],
    buildingsQuery.data ?? [],
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Thông báo"
            className="text-muted-foreground hover:text-foreground relative"
          >
            <Bell className="size-4" />
            {entries.length > 0 && (
              <span
                className={cn(
                  "bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full text-xs font-bold",
                )}
              >
                {entries.length > 9 ? "9+" : entries.length}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-95 gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Việc cần làm</h3>
            {entries.length > 0 && (
              <Badge className="h-5 px-1.5 text-xs">{entries.length}</Badge>
            )}
          </div>
        </div>

        <ScrollArea className="h-80">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted mb-3 flex size-10 items-center justify-center rounded-full">
                <Bell className="text-muted-foreground size-5 opacity-50" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                Không có việc cần làm
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {entries.map((entry) => (
                <NotificationEntry key={entry.key} entry={entry} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
