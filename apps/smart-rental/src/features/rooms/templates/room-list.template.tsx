import { Download, FileText, LayoutGrid, List, Plus } from "lucide-react";
import { useSearchParams } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@monorepo/ui/components/tabs";

import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import {
  roomStatusConfig,
  roomTypeConfig,
  toFilterOptions,
} from "~/constants/status";
import { roomColumns } from "~/features/rooms/components/room-columns";
import RoomGrid from "~/features/rooms/components/room-grid";
import { useGetRooms } from "~/hooks/api/room";
import { useBuildingStore } from "~/stores/use-building-store";

const VIEW_PARAM = "view";
type View = "grid" | "table";

/**
 * "Danh sách phòng trọ": the first consumer of the list composite. The view
 * (cards by floor, or the table) rides on the URL beside the filters, so a
 * reload keeps it too. "Xuất Excel" and "Thêm phòng" have no flow yet, as in
 * the prototype.
 */
export default function RoomListTemplate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: View =
    searchParams.get(VIEW_PARAM) === "table" ? "table" : "grid";
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetRooms({
    buildingId: selectedBuildingId,
  });

  const setView = (next: View) =>
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === "grid") params.delete(VIEW_PARAM);
        else params.set(VIEW_PARAM, next);
        return params;
      },
      { replace: true },
    );

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Danh sách phòng trọ"
        description="Quản lý toàn bộ phòng trọ, trạng thái và thông tin khách thuê."
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
        <LoadingPanel
          className="md:grid-cols-4 lg:grid-cols-5"
          itemCount={10}
        />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách phòng."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <Tabs value={view} onValueChange={(value) => setView(value as View)}>
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
            viewSwitch={
              <TabsList className="bg-muted/50">
                <TabsTrigger value="grid">
                  <LayoutGrid />
                  <span className="hidden sm:inline">Dạng thẻ</span>
                </TabsTrigger>
                <TabsTrigger value="table">
                  <List />
                  <span className="hidden sm:inline">Dạng bảng</span>
                </TabsTrigger>
              </TabsList>
            }
            renderRows={
              view === "grid"
                ? (rooms) => <RoomGrid rooms={rooms} />
                : undefined
            }
          />
        </Tabs>
      )}
    </div>
  );
}
