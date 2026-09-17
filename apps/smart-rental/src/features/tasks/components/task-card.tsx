import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

import type { Task } from "~/types/task";
import { StatusBadge } from "~/components/badge/status-badge";
import { EntityListCard } from "~/components/card/entity-list-card";
import {
  taskPriorityConfig,
  taskStatusConfig,
  taskTypeConfig,
} from "~/constants/status";
import {
  formatDueLabel,
  taskRelatedPath,
} from "~/features/tasks/utils/task-due";

interface TaskCardProps {
  task: Task;
}

/** One Việc cần làm: title, priority, type + status badges, the due line, and the link to its entity. */
export default function TaskCard({ task }: TaskCardProps) {
  const due = formatDueLabel(task.dueDate, new Date());

  return (
    <EntityListCard
      header={
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-2 text-base">
                {task.title}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {task.description}
              </CardDescription>
            </div>
            <StatusBadge
              config={taskPriorityConfig[task.priority]}
              className="whitespace-nowrap"
            />
          </div>
        </CardHeader>
      }
      content={
        <CardContent className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge config={taskTypeConfig[task.type]} />
            <StatusBadge config={taskStatusConfig[task.status]} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hạn:</span>
            <span
              className={cn(due.isOverdue && "text-destructive font-medium")}
            >
              {due.text}
            </span>
          </div>
        </CardContent>
      }
      footer={
        <CardFooter className="justify-end">
          <Link
            to={taskRelatedPath(task)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground hover:text-primary",
            )}
          >
            Xem chi tiết
            <ChevronRight />
          </Link>
        </CardFooter>
      }
    />
  );
}
