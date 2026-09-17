import { AlertCircle, CheckSquare, Clock, Wrench } from "lucide-react";

import type { TaskType } from "~/types/task";
import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import {
  taskPriorityConfig,
  taskStatusConfig,
  taskTypeConfig,
  toFilterOptions,
} from "~/constants/status";
import TaskCard from "~/features/tasks/components/task-card";
import { taskColumns } from "~/features/tasks/components/task-columns";
import { useGetTasks } from "~/hooks/api/task";

const summaryTiles: {
  type: TaskType;
  icon: typeof AlertCircle;
  iconClassName: string;
}[] = [
  {
    type: "invoice_overdue",
    icon: AlertCircle,
    iconClassName: "bg-destructive/10 text-destructive",
  },
  {
    type: "contract_expiring",
    icon: Clock,
    iconClassName: "bg-warning/10 text-warning",
  },
  {
    type: "maintenance",
    icon: Wrench,
    iconClassName: "bg-info/10 text-info",
  },
];

/** "Việc cần làm" (ADR-0011): a count per kind over the whole list, then the filtered card grid. */
export default function TaskCenterTemplate() {
  const { data, isLoading, isError, refetch } = useGetTasks();
  const tasks = data ?? [];

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Việc cần làm"
        description="Quản lý những nhiệm vụ cần xử lý"
      />

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách nhiệm vụ."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summaryTiles.map((tile) => (
              <SummaryCard
                key={tile.type}
                label={taskTypeConfig[tile.type].label}
                value={tasks.filter((task) => task.type === tile.type).length}
                icon={tile.icon}
                iconClassName={tile.iconClassName}
              />
            ))}
          </div>

          <DataTable
            columns={taskColumns}
            data={tasks}
            getRowId={(task) => task.id}
            search={{ columnId: "title", placeholder: "Tìm kiếm nhiệm vụ..." }}
            facets={[
              {
                columnId: "priority",
                title: "Mức độ ưu tiên",
                options: toFilterOptions(taskPriorityConfig),
              },
              {
                columnId: "status",
                title: "Trạng thái",
                options: toFilterOptions(taskStatusConfig),
              },
              {
                columnId: "type",
                title: "Loại nhiệm vụ",
                options: toFilterOptions(taskTypeConfig),
              },
            ]}
            empty={{
              icon: CheckSquare,
              title: "Không có nhiệm vụ",
              description:
                "Tất cả các nhiệm vụ đã được xử lý hoặc không có nhiệm vụ phù hợp",
            }}
            resultLabel={(count) => `${count} nhiệm vụ`}
            renderRows={(rows) => (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rows.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          />
        </>
      )}
    </div>
  );
}
