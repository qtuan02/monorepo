import { CheckSquare } from "lucide-react";

import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { TableSkeleton } from "~/components/panel/loading-panel";
import TaskQueue from "~/components/queue/task-queue";
import {
  taskPriorityConfig,
  taskTypeConfig,
  toFilterOptions,
} from "~/constants/status";
import { taskColumns } from "~/features/tasks/components/task-columns";
import { useGetTasks } from "~/hooks/api/task";
import { useBuildingStore } from "~/stores/use-building-store";

/**
 * "Việc cần làm" (spec #153 §10 row 9): a read-only screen — the same queue
 * "Hôm nay" renders, in full, filtered by loại/ưu tiên on the URL. No create
 * form: every row is derived, never authored by hand.
 */
export default function TaskCenterTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetTasks({
    buildingId: selectedBuildingId,
  });
  const tasks = data ?? [];

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Việc cần làm"
        description={`${tasks.length} việc`}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách việc cần làm."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <DataTable
          columns={taskColumns}
          data={tasks}
          getRowId={(task) => task.id}
          paginate={false}
          search={{
            columnId: "title",
            placeholder: "Tìm kiếm việc cần làm...",
          }}
          facets={[
            {
              columnId: "type",
              title: "Loại việc",
              options: toFilterOptions(taskTypeConfig),
            },
            {
              columnId: "priority",
              title: "Mức độ ưu tiên",
              options: toFilterOptions(taskPriorityConfig),
            },
          ]}
          empty={{
            icon: CheckSquare,
            title: "Không có việc cần làm",
            description: "Mọi việc đã được xử lý hoặc không có việc phù hợp.",
          }}
          renderRows={(rows) => <TaskQueue tasks={rows} />}
        />
      )}
    </div>
  );
}
