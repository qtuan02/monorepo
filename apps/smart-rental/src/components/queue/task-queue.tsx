import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  FileClock,
  Gauge,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@monorepo/ui/components/collapsible";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";
import { cn } from "@monorepo/ui/utils/cn";

import type { Task, TaskType } from "~/types/task";
import type { OverdueQueueGroup, TaskQueueEntry } from "~/utils/task-queue";
import SendReminderDialog from "~/components/dialog/send-reminder-dialog";
import VietQrDialog from "~/components/dialog/vietqr-dialog";
import PaymentFormSheet from "~/components/sheet/payment-form-sheet";
import { ROUTES } from "~/constants/routes";
import { useGetBuilding } from "~/hooks/api/building";
import { formatCurrency } from "~/utils/currency";
import { daysOverdue } from "~/utils/invoice-status";
import { taskRelatedPath } from "~/utils/task-due";

const taskTypeIcon: Record<TaskType, LucideIcon> = {
  invoice_overdue: Bell,
  contract_expiring: FileClock,
  maintenance: Wrench,
  utility_anomaly: Gauge,
  residence_notification: ShieldAlert,
  batch_pending: Bell,
};

interface TaskAction {
  label: string;
  to: string;
}

/**
 * The action(s) for one single Việc (spec #179 §"Hôm nay") — Hoá đơn quá
 * hạn never reaches here any more, it is always part of an
 * `OverdueQueueGroup` instead (see `~/utils/task-queue`). Primary is always
 * the hành động ghi nhận; "Xem" (when present) is the ghost secondary.
 */
function actionsFor(task: Task): TaskAction[] {
  switch (task.type) {
    case "contract_expiring":
      return [
        { label: "Gia hạn", to: ROUTES.contractRenewPath(task.relatedId) },
        {
          label: "Thanh lý",
          to: ROUTES.contractLiquidationPath(task.relatedId),
        },
      ];
    case "utility_anomaly":
      return [{ label: "Sửa chỉ số", to: taskRelatedPath(task) }];
    case "residence_notification":
      return [{ label: "Khai báo", to: taskRelatedPath(task) }];
    case "batch_pending":
      return [{ label: "Lập Đợt hoá đơn", to: taskRelatedPath(task) }];
    case "invoice_overdue":
    case "maintenance":
      return [{ label: "Xem", to: taskRelatedPath(task) }];
  }
}

function TaskActionsRow({ task }: { task: Task }) {
  return (
    <ItemActions className="w-full flex-wrap md:w-auto">
      {actionsFor(task).map((action, index) => (
        <Link
          key={action.label}
          to={action.to}
          className={cn(
            buttonVariants({
              size: "default",
              variant: index === 0 ? "default" : "outline",
            }),
          )}
        >
          {action.label}
        </Link>
      ))}
    </ItemActions>
  );
}

/**
 * "Ghi nhận thu" (sheet điền sẵn còn lại) + "VietQR" for one Hoá đơn quá
 * hạn — the two hành động every mục, single or gộp, offers per Hoá đơn
 * (spec #179 §"Hôm nay" AC). Its own component so a mục of exactly one
 * invoice can render them inline, without a Collapsible around one row.
 */
function OverdueInvoiceActions({
  invoice,
  buildingId,
}: {
  invoice: OverdueQueueGroup["invoices"][number];
  buildingId: string;
}) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const buildingQuery = useGetBuilding(buildingId, { enabled: !!buildingId });

  return (
    <>
      <Button
        type="button"
        size="default"
        onClick={() => setIsPaymentOpen(true)}
      >
        Ghi nhận thu
      </Button>
      <VietQrDialog
        invoiceId={invoice.invoiceId}
        amount={invoice.outstanding}
        invoiceNumber={invoice.invoiceNumber}
        room={invoice.room}
        bankAccount={buildingQuery.data?.bankAccount}
        buildingId={buildingId}
        variant="outline"
        size="default"
        className=""
      />

      <PaymentFormSheet
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        invoiceId={invoice.invoiceId}
        invoiceNumber={invoice.invoiceNumber}
        defaultAmount={invoice.outstanding}
      />
    </>
  );
}

/** One dòng con của mục gộp (≥ 2 Hoá đơn), thụt trái nền muted. */
function OverdueInvoiceRow({
  invoice,
  buildingId,
}: {
  invoice: OverdueQueueGroup["invoices"][number];
  buildingId: string;
}) {
  return (
    <Item variant="muted" className="pl-8">
      <ItemContent>
        <ItemTitle>
          {invoice.invoiceNumber} · {invoice.room} · {invoice.tenant}
        </ItemTitle>
        <ItemDescription>
          {formatCurrency(invoice.outstanding)} còn lại
        </ItemDescription>
      </ItemContent>
      <ItemActions className="w-full flex-wrap md:w-auto">
        <OverdueInvoiceActions invoice={invoice} buildingId={buildingId} />
      </ItemActions>
    </Item>
  );
}

/**
 * The Hoá đơn quá hạn của một Toà nhà, gộp thành một mục: tổng còn lại,
 * "Nhắc tất cả" (ghi nhật ký thật cho mọi Hoá đơn của mục), và mở rộng ra
 * từng dòng con (spec #179 §"Hôm nay" AC).
 */
function OverdueGroupItem({ group }: { group: OverdueQueueGroup }) {
  const soonest = group.invoices[0];
  const overdueDays = soonest ? daysOverdue(soonest.dueDate) : 0;

  // One Hoá đơn is not a mục to "mở rộng" — show its own hành động inline,
  // exactly like every other single-invoice Việc, rather than making the
  // landlord click "Xem 1 hoá đơn" to reach the one row that was already
  // the whole point (spec #179's own "ít bước" goal).
  if (group.invoices.length === 1 && soonest) {
    return (
      <Item variant="outline" role="listitem">
        <ItemMedia variant="icon">
          <Bell />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            {soonest.invoiceNumber} · {soonest.room} · {soonest.tenant}
          </ItemTitle>
          <ItemDescription>
            {formatCurrency(soonest.outstanding)} còn lại · quá {overdueDays}{" "}
            ngày
          </ItemDescription>
        </ItemContent>
        <ItemActions className="w-full flex-wrap md:w-auto">
          <OverdueInvoiceActions
            invoice={soonest}
            buildingId={group.buildingId}
          />
        </ItemActions>
      </Item>
    );
  }

  return <OverdueGroupCollapsible group={group} overdueDays={overdueDays} />;
}

function OverdueGroupCollapsible({
  group,
  overdueDays,
}: {
  group: OverdueQueueGroup;
  overdueDays: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Item variant="outline" role="listitem">
          <ItemMedia variant="icon">
            <Bell />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              {group.invoices.length} Hoá đơn quá hạn ·{" "}
              {formatCurrency(group.totalOutstanding)}
            </ItemTitle>
            <ItemDescription>
              {group.buildingName} · quá {overdueDays} ngày
            </ItemDescription>
          </ItemContent>
          <ItemActions className="w-full flex-wrap md:w-auto">
            <Button
              type="button"
              size="default"
              onClick={() => setIsReminderOpen(true)}
            >
              Nhắc tất cả
            </Button>
            <CollapsibleTrigger
              render={
                <Button type="button" size="default" variant="outline">
                  <ChevronDown
                    className={cn(
                      "transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                  {isExpanded
                    ? "Ẩn bớt"
                    : `Xem ${group.invoices.length} hoá đơn`}
                </Button>
              }
            />
          </ItemActions>
        </Item>

        <CollapsibleContent className="space-y-1 pt-1">
          {group.invoices.map((invoice) => (
            <OverdueInvoiceRow
              key={invoice.invoiceId}
              invoice={invoice}
              buildingId={group.buildingId}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>

      <SendReminderDialog
        open={isReminderOpen}
        onOpenChange={setIsReminderOpen}
        invoiceIds={group.invoices.map((invoice) => invoice.invoiceId)}
      />
    </>
  );
}

function SingleTaskItem({ task }: { task: Task }) {
  const Icon = taskTypeIcon[task.type];
  return (
    <Item variant="outline" role="listitem">
      <ItemMedia variant="icon">
        <Icon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{task.title}</ItemTitle>
        <ItemDescription>{task.description}</ItemDescription>
      </ItemContent>
      <TaskActionsRow task={task} />
    </Item>
  );
}

interface TaskQueueProps {
  entries: TaskQueueEntry[];
}

/**
 * Hôm nay's own hàng đợi (spec #179 §"Hôm nay"): Hoá đơn quá hạn cùng Toà
 * nhà gộp thành một mục, mọi loại khác giữ một mục/một hành động — cả hai
 * sắp chung theo hạn (`~/utils/task-queue`). No badge ưu tiên any more: the
 * queue's own order already says what's urgent.
 */
export function TaskQueue({ entries }: TaskQueueProps) {
  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        Không có việc nào.
      </p>
    );
  }

  return (
    <ItemGroup>
      {entries.map((entry) =>
        entry.kind === "overdue-group" ? (
          <OverdueGroupItem key={entry.key} group={entry} />
        ) : (
          <SingleTaskItem key={entry.key} task={entry.task} />
        ),
      )}
    </ItemGroup>
  );
}
