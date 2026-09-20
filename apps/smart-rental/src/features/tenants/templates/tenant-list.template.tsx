import { useState } from "react";
import { Plus, Users } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { tenantStatusConfig, toFilterOptions } from "~/constants/status";
import TenantCard from "~/features/tenants/components/tenant-card";
import { tenantColumns } from "~/features/tenants/components/tenant-columns";
import TenantFormSheet from "~/features/tenants/components/tenant-form-sheet";
import TenantMobileRow from "~/features/tenants/components/tenant-mobile-row";
import { useGetTenants } from "~/hooks/api/tenant";
import { useBuildingStore } from "~/stores/use-building-store";

/**
 * "Quản lý Người thuê": the list composite with a card/table view on the
 * URL — no KPI strip above it (round 4, #245): "Tổng/Đang thuê/Đã rời" never
 * moved from the Mock's seed count, so the strip only ever repeated the
 * table's own facet counts. "Thêm Người thuê" goes to the create screen —
 * the prototype's second, thinner create dialog is folded into it.
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
        mobileAction={
          <Button
            type="button"
            size="icon-sm"
            aria-label="Tạo Người thuê"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus />
          </Button>
        }
      />

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
