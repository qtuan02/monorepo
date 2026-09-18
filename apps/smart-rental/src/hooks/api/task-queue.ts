import type { TaskQueueEntry } from "~/utils/task-queue";
import { useGetBuildings } from "~/hooks/api/building";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useGetTasks } from "~/hooks/api/task";
import { buildTaskQueueEntries } from "~/utils/task-queue";

/**
 * Hôm nay's own hàng đợi (spec #179 §"Hôm nay") — the one seam both the
 * queue card and the header's chuông read through, so they can never gộp
 * differently. Composes three queries (Việc cần làm, Hoá đơn quá hạn của
 * mỗi mục, tên Toà nhà) rather than a fourth Mock of its own. Its own file —
 * not `~/hooks/api/task.ts` — because this hook needs both `useGetTasks` and
 * `useGetInvoices`.
 */
export function useGetTaskQueueEntries(buildingId: string | null): {
  entries: TaskQueueEntry[];
  isLoading: boolean;
} {
  const tasksQuery = useGetTasks({ buildingId });
  const invoicesQuery = useGetInvoices({ buildingId });
  const buildingsQuery = useGetBuildings();
  const isLoading =
    tasksQuery.isLoading || invoicesQuery.isLoading || buildingsQuery.isLoading;

  return {
    entries: buildTaskQueueEntries(
      tasksQuery.data ?? [],
      invoicesQuery.data ?? [],
      buildingsQuery.data ?? [],
    ),
    isLoading,
  };
}
