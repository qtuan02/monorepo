import { useState } from "react";
import { Plus, Users } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import type { TenantStatus, TenantView } from "~/types/tenant";
import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { tenantStatusConfig, toFilterOptions } from "~/constants/status";
import TenantCard from "~/features/tenants/components/tenant-card";
import { tenantColumns } from "~/features/tenants/components/tenant-columns";
import TenantFormSheet from "~/features/tenants/components/tenant-form-sheet";
import TenantMobileRow from "~/features/tenants/components/tenant-mobile-row";
import { useGetTenants } from "~/hooks/api/tenant";
import { useBuildingStore } from "~/stores/use-building-store";

/** The three KPI tiles above the list; a `status` counts that status, none counts everything. */
const summaryTiles: { label: string; status?: TenantStatus }[] = [
  { label: "Tổng Người thuê" },
  { label: "Đang thuê", status: "active" },
  { label: "Đã rời", status: "ended" },
];

function countByStatus(tenants: TenantView[], status?: TenantStatus) {
  return status
    ? tenants.filter((tenant) => tenant.status === status).length
    : tenants.length;
}

/**
 * "Quản lý Người thuê": KPI tiles over the scoped list, then the list
 * composite with a card/table view on the URL. "Thêm Người thuê" goes to the
 * create screen — the prototype's second, thinner create dialog is folded
 * into it.
 */
export default function TenantListTemplate() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const tenantsQuery = useGetTenants({ buildingId: selectedBuildingId });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Người thuê"
        description="Theo dõi thông tin, trạng thái và hợp đồng của tất cả Người thuê."
        actions={
          <Button type="button" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus />
            Thêm Người thuê
          </Button>
        }
      />

      {tenantsQuery.isLoading ? (
        <KpiStripSkeleton count={3} />
      ) : (
        !tenantsQuery.isError && (
          <KpiStrip
            items={summaryTiles.map((tile) => ({
              label: tile.label,
              value: countByStatus(tenantsQuery.data ?? [], tile.status),
            }))}
          />
        )
      )}

      <DataTable
        columns={tenantColumns}
        query={tenantsQuery}
        getRowId={(tenant) => tenant.id}
        search={{
          columnId: "name",
          placeholder: "Tìm tên Người thuê...",
        }}
        facets={[
          {
            columnId: "status",
            title: "Trạng thái",
            options: toFilterOptions(tenantStatusConfig),
          },
        ]}
        empty={{ icon: Users, title: "Không tìm thấy Người thuê" }}
        entityLabel="Người thuê"
        defaultSort={{ columnId: "name" }}
        card={(tenant) => <TenantCard tenant={tenant} />}
        renderMobileRow={(tenant) => <TenantMobileRow tenant={tenant} />}
      />

      <TenantFormSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
