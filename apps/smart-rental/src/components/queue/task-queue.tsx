import type { LucideIcon } from "lucide-react";
import { Bell, FileClock, Gauge, ShieldAlert, Wrench } from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";
import { toast } from "@monorepo/ui/components/toast";
import { cn } from "@monorepo/ui/utils/cn";

import type { Task, TaskType } from "~/types/task";
import { StatusBadge } from "~/components/badge/status-badge";
import { ROUTES } from "~/constants/routes";
import { taskPriorityConfig } from "~/constants/status";
import { taskRelatedPath } from "~/utils/task-due";

const taskTypeIcon: Record<TaskType, LucideIcon> = {
  invoice_overdue: Bell,
  contract_expiring: FileClock,
  maintenance: Wrench,
  utility_anomaly: Gauge,
  residence_notification: ShieldAlert,
  batch_pending: Bell,
};

type TaskAction =
  | { kind: "link"; label: string; to: string }
  | { kind: "reminder"; label: string };

/**
 * The action(s) for one Việc cần làm, keyed by its five sources (spec #153
 * §3.2, §10 row 9). Every `link` resolves to a route `taskRelatedPath` (or a
 * builder from the same `ROUTES` table) already proves exists for the
 * entity — "Gửi nhắc" is the one exception, a reminder log with no route of
 * its own yet (ADR-0012's Gửi nhắc/Thông báo decision), so it stays a
 * toast, exactly like the invoice list's own selection-bar action.
 */
function actionsFor(task: Task): TaskAction[] {
  switch (task.type) {
    case "invoice_overdue":
      return [
        { kind: "reminder", label: "Gửi nhắc" },
        { kind: "link", label: "Xem", to: taskRelatedPath(task) },
      ];
    case "contract_expiring":
      return [
        {
          kind: "link",
          label: "Gia hạn",
          to: ROUTES.contractRenewPath(task.relatedId),
        },
        {
          kind: "link",
          label: "Thanh lý",
          to: ROUTES.contractLiquidationPath(task.relatedId),
        },
      ];
    case "utility_anomaly":
      return [{ kind: "link", label: "Xem chỉ số", to: taskRelatedPath(task) }];
    case "residence_notification":
      return [{ kind: "link", label: "Khai báo", to: taskRelatedPath(task) }];
    case "batch_pending":
      return [{ kind: "link", label: "Lập đợt", to: ROUTES.INVOICE_BATCH }];
    case "maintenance":
      return [{ kind: "link", label: "Xem", to: taskRelatedPath(task) }];
  }
}

function remindTask(task: Task) {
  toast.add({
    title: `Đã gửi nhắc — ${task.title}`,
    description: "Nhật ký nhắc được ghi trên hoá đơn.",
  });
}

interface TaskQueueProps {
  tasks: Task[];
}

/**
 * "Cần làm hôm nay" — each Việc cần làm as an Item, its own action(s) beside
 * it. One badge (ưu tiên) per item — the prototype's three (ưu tiên + loại +
 * trạng thái, all on the same card) is research C.1 #8's own defect; loại
 * already reads from the icon, and trạng thái is always "open" now that
 * Việc cần làm has no Mock of its own (spec #153 §10 row 9).
 */
export function TaskQueue({ tasks }: TaskQueueProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        Hôm nay không có việc cần làm.{" "}
        <Link
          to={ROUTES.INVOICES}
          className="text-primary underline underline-offset-4"
        >
          Xem Hoá đơn
        </Link>
      </p>
    );
  }

  return (
    <ItemGroup>
      {tasks.map((task) => {
        const Icon = taskTypeIcon[task.type];
        return (
          <Item key={task.id} variant="outline" role="listitem">
            <ItemMedia variant="icon">
              <Icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {task.title}
                <StatusBadge
                  config={taskPriorityConfig[task.priority]}
                  isCompact
                  className="shrink-0"
                />
              </ItemTitle>
              <ItemDescription>{task.description}</ItemDescription>
            </ItemContent>
            {/* Own row on < md (spec #179 §"IA và mobile" #37): squeezed
                beside ItemContent's flex-1, the action row had no width left
                and "Xem" truncated to "Xe". `size="default"` (h-9) also
                clears the 36px touch-target floor the old `sm` (h-8) missed. */}
            <ItemActions className="w-full flex-wrap md:w-auto">
              {actionsFor(task).map((action, index) => {
                const variant = index === 0 ? "default" : "outline";
                return action.kind === "reminder" ? (
                  <Button
                    key={action.label}
                    type="button"
                    size="default"
                    variant={variant}
                    onClick={() => remindTask(task)}
                  >
                    {action.label}
                  </Button>
                ) : (
                  <Link
                    key={action.label}
                    to={action.to}
                    className={cn(buttonVariants({ size: "default", variant }))}
                  >
                    {action.label}
                  </Link>
                );
              })}
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
