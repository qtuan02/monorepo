import { Download, FileText, Plus } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import { DataTable } from "~/components/data-table/data-table";
import { ListViewSwitch, useListView } from "~/components/data-table/list-view";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import {
  roomStatusConfig,
  roomTypeConfig,
  toFilterOptions,
} from "~/constants/status";
import { roomColumns } from "~/features/rooms/components/room-columns";
import RoomGrid from "~/features/rooms/components/room-grid";
import { useGetRooms } from "~/hooks/api/room";
import { useBuildingStore } from "~/stores/use-building-store";

/**
 * "Danh sách phòng" (ADR-0011): the first consumer of the list composite. The
 * view (cards by floor, or the table) rides on the URL beside the filters, so
 * a reload keeps it too. "Xuất Excel" and "Thêm phòng" have no flow yet, as in
 * the prototype.
 */
export default function RoomListTemplate() {
  const [view, setView] = useListView();
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetRooms({
    buildingId: selectedBuildingId,
  });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Danh sách phòng"
        description="Quản lý toàn bộ phòng trọ, trạng thái và thông tin Người thuê."
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              <Download />
              Xuất Excel
            </Button>
            <Button type="button" size="sm">
              <Plus />
              Thêm phòng
            </Button>
          </>
        }
      />

      {isLoading ? (
        <CardGridSkeleton
          className="md:grid-cols-4 lg:grid-cols-5"
          itemCount={10}
        />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách phòng."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <DataTable
          columns={roomColumns}
          data={data ?? []}
          getRowId={(room) => room.id}
          search={{ columnId: "name", placeholder: "Tìm tên phòng..." }}
          facets={[
            {
              columnId: "status",
              title: "Trạng thái",
              options: toFilterOptions(roomStatusConfig),
            },
            {
              columnId: "type",
              title: "Loại phòng",
              options: toFilterOptions(roomTypeConfig),
            },
          ]}
          empty={{
            icon: FileText,
            title: "Không tìm thấy phòng",
            description:
              "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
          }}
          resultLabel={(count) => `${count} phòng được tìm thấy`}
          viewSwitch={<ListViewSwitch view={view} onViewChange={setView} />}
          renderRows={
            view === "grid" ? (rooms) => <RoomGrid rooms={rooms} /> : undefined
          }
        />
      )}
    </div>
  );
}
