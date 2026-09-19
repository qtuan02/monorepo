import { useState } from "react";
import { FileText, Plus } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import {
  roomStatusConfig,
  roomTypeConfig,
  toFilterOptions,
} from "~/constants/status";
import { roomColumns } from "~/features/rooms/components/room-columns";
import RoomFormSheet from "~/features/rooms/components/room-form-sheet";
import RoomGrid from "~/features/rooms/components/room-grid";
import RoomMobileRow from "~/features/rooms/components/room-mobile-row";
import { useGetBuildings } from "~/hooks/api/building";
import { useGetRooms } from "~/hooks/api/room";
import { useBuildingStore } from "~/stores/use-building-store";

/**
 * "Danh sách phòng" (spec #153 §10 row 43): the grid groups by floor and
 * shows the whole scope, never a page — `DataTable` auto-disables pagination
 * while this `renderRows` grid is the view showing (spec #221 T2), the table
 * keeps normal paging. The view (cards by floor, or the table) rides on the
 * URL beside the filters, so a reload keeps it.
 */
export default function RoomListTemplate() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const roomsQuery = useGetRooms({ buildingId: selectedBuildingId });
  // Only fetched at scope null — the grid then groups by Toà nhà above tầng
  // (spec #179 §"Danh sách và Phòng"), the select-room pattern for a name map.
  const { data: buildings = [] } = useGetBuildings({
    enabled: !selectedBuildingId,
  });
  const buildingNameById = selectedBuildingId
    ? undefined
    : new Map(buildings.map((building) => [building.id, building.name]));

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Phòng"
        description="Quản lý toàn bộ phòng trọ, trạng thái và thông tin Người thuê."
        actions={
          <Button type="button" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus />
            Thêm phòng
          </Button>
        }
      />

      <DataTable
        columns={roomColumns}
        query={roomsQuery}
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
        empty={{ icon: FileText, title: "Không tìm thấy phòng" }}
        entityLabel="phòng"
        defaultView="grid"
        renderRows={(rooms) => (
          <RoomGrid rooms={rooms} buildingNameById={buildingNameById} />
        )}
        renderMobileRow={(room) => <RoomMobileRow room={room} />}
      />

      <RoomFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        defaultBuildingId={selectedBuildingId}
      />
    </div>
  );
}
