import { useState } from "react";
import { Building2, Plus } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import { toast } from "@monorepo/ui/components/toast";

import type { Building } from "~/types/building";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import BuildingCard from "~/features/buildings/components/building-card";
import BuildingFormSheet from "~/features/buildings/components/building-form-sheet";
import { useDeleteBuilding, useGetBuildings } from "~/hooks/api/building";
import { useGetContracts } from "~/hooks/api/contract";
import { useBuildingStore } from "~/stores/use-building-store";
import { canDeleteBuilding } from "~/utils/building-delete";

/**
 * "Quản lý Toà nhà": a card grid, as the prototype — a Toà nhà is a handful of
 * rows, not a table. Under a Building scope only that Toà nhà shows; the
 * scope is the selector's business, so the filter is applied here over the
 * unscoped list the selector also reads.
 */
export default function BuildingListTemplate() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingBuilding, setDeletingBuilding] = useState<Building | null>(
    null,
  );
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetBuildings();
  const contractsQuery = useGetContracts();
  const deleteBuilding = useDeleteBuilding();

  const buildings = (data ?? []).filter(
    (building) => !selectedBuildingId || building.id === selectedBuildingId,
  );
  const contracts = contractsQuery.data ?? [];

  const handleDelete = () => {
    if (!deletingBuilding) return;
    deleteBuilding.mutate(deletingBuilding.id, {
      onSuccess: () => {
        toast.add({
          title: `Đã xóa ${deletingBuilding.name}`,
          type: "success",
        });
        setDeletingBuilding(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Toà nhà"
        description="Quản lý danh sách các khu trọ, toà nhà của bạn"
        actions={
          <Button type="button" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus />
            Thêm toà nhà
          </Button>
        }
        mobileAction={
          <Button
            type="button"
            size="icon-sm"
            aria-label="Tạo toà nhà"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus />
          </Button>
        }
      />

      {isLoading ? (
        <CardGridSkeleton />
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
            <BuildingCard
              key={building.id}
              building={building}
              canDelete={canDeleteBuilding(building.id, contracts)}
              onDelete={() => setDeletingBuilding(building)}
            />
          ))}
        </div>
      )}

      <BuildingFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} />

      <ConfirmActionDialog
        open={!!deletingBuilding}
        onOpenChange={(open) => !open && setDeletingBuilding(null)}
        title="Xóa toà nhà"
        description={`Bạn có chắc chắn muốn xóa toà nhà "${deletingBuilding?.name}" không? Hành động này không thể hoàn tác.`}
        actionLabel="Xóa"
        variant="destructive"
        isPending={deleteBuilding.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
