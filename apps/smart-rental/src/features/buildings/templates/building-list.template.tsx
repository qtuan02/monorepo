import { useState } from "react";
import { Building2, Plus } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import BuildingCard from "~/features/buildings/components/building-card";
import BuildingFormDialog from "~/features/buildings/components/building-form-dialog";
import { useGetBuildings } from "~/hooks/api/building";
import { useBuildingStore } from "~/stores/use-building-store";

/**
 * "Quản lý Toà nhà": a card grid, as the prototype — a Toà nhà is a handful of
 * rows, not a table. Under a Building scope only that Toà nhà shows; the
 * scope is the selector's business, so the filter is applied here over the
 * unscoped list the selector also reads.
 */
export default function BuildingListTemplate() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetBuildings();

  const buildings = (data ?? []).filter(
    (building) => !selectedBuildingId || building.id === selectedBuildingId,
  );

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Quản lý Toà nhà"
        description="Quản lý danh sách các khu trọ, toà nhà của bạn"
        actions={
          <Button type="button" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus />
            Thêm toà nhà
          </Button>
        }
      />

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách toà nhà."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : buildings.length === 0 ? (
        <EmptyPanel
          icon={Building2}
          title="Chưa có toà nhà"
          description="Thêm toà nhà đầu tiên để bắt đầu quản lý phòng."
          action={{ label: "Thêm toà nhà", onClick: () => setIsFormOpen(true) }}
          className="border"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((building) => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      )}

      <BuildingFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
