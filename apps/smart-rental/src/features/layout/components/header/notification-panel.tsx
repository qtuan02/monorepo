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
import { Separator } from "@monorepo/ui/components/separator";
import { cn } from "@monorepo/ui/utils/cn";

import type { Task, TaskType } from "~/types/task";
import { ROUTES } from "~/constants/routes";
import { useGetTasks } from "~/hooks/api/task";
import { useBuildingStore } from "~/stores/use-building-store";
import { taskRelatedPath } from "~/utils/task-due";

const taskTypeIcon: Record<TaskType, LucideIcon> = {
  invoice_overdue: Bell,
  contract_expiring: FileClock,
  maintenance: Wrench,
  utility_anomaly: Gauge,
  residence_notification: ShieldAlert,
  batch_pending: Bell,
};

interface TaskNotificationProps {
  task: Task;
}

function TaskNotification({ task }: TaskNotificationProps) {
  const Icon = taskTypeIcon[task.type];

  return (
    <Link
      to={taskRelatedPath(task)}
      className="hover:bg-muted/60 flex w-full gap-3 px-4 py-3.5 text-left transition-colors"
    >
      <div className="bg-muted mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm leading-tight font-medium">
          {task.title}
        </p>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
          {task.description}
        </p>
      </div>
    </Link>
  );
}

/**
 * The bell in the header (ADR-0011, spec #153 §10 — "chuông đọc Việc cần
 * làm"): the same `useGetTasks` the Hôm nay queue and `/tasks` both read, so
 * there is one Việc cần làm cache rather than a second, hand-authored feed.
 * There is no read/unread state — a Việc cần làm has no such concept
 * (ADR-0012), so every item shown here is, by construction, still open.
 */
export default function NotificationPanel() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data: tasks = [] } = useGetTasks({ buildingId: selectedBuildingId });

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
            {tasks.length > 0 && (
              <span
                className={cn(
                  "bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full text-[9px] font-bold",
                )}
              >
                {tasks.length > 9 ? "9+" : tasks.length}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-95 gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Việc cần làm</h3>
            {tasks.length > 0 && (
              <Badge className="h-5 px-1.5 text-xs">{tasks.length}</Badge>
            )}
          </div>
        </div>

        <ScrollArea className="h-80">
          {tasks.length === 0 ? (
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
              {tasks.map((task) => (
                <TaskNotification key={task.id} task={task} />
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="px-4 py-2.5">
          <Link
            to={ROUTES.TASKS}
            className="text-muted-foreground hover:text-foreground block w-full text-center text-xs"
          >
            Xem tất cả việc cần làm
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
