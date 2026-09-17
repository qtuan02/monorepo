import { Badge } from "@monorepo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

import type { DashboardTask } from "~/types/dashboard";

const priorityVariant: Record<
  DashboardTask["priority"],
  "destructive" | "default" | "secondary"
> = {
  "Khẩn cấp": "destructive",
  Cao: "default",
  Vừa: "secondary",
};

interface PendingTasksCardProps {
  tasks: DashboardTask[];
}

/** "Việc cần làm": the few tasks due soonest, a priority badge on each. */
export default function PendingTasksCard({ tasks }: PendingTasksCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Việc cần làm</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {tasks.map((task) => {
            const isDueNow =
              task.due.includes("Quá hạn") || task.due.includes("Hôm nay");
            return (
              <li
                key={task.id}
                className="flex items-start justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-tight font-medium">
                    {task.title}
                  </p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                    <span>{task.type}</span>
                    <span aria-hidden="true">•</span>
                    <span
                      className={cn(isDueNow && "text-destructive font-medium")}
                    >
                      {task.due}
                    </span>
                  </div>
                </div>
                <Badge variant={priorityVariant[task.priority]}>
                  {task.priority}
                </Badge>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
