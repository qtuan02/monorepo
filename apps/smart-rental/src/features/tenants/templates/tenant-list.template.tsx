import { Download, Plus, Users } from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";

import type { TenantStatus, TenantView } from "~/types/tenant";
import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListViewSwitch, useListView } from "~/components/data-table/list-view";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { tenantStatusConfig, toFilterOptions } from "~/constants/status";
import TenantCard from "~/features/tenants/components/tenant-card";
import { tenantColumns } from "~/features/tenants/components/tenant-columns";
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
 * into it. "Xuất Excel" has no flow yet, as in the prototype.
 */
export default function TenantListTemplate() {
  const [view, setView] = useListView();
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetTenants({
    buildingId: selectedBuildingId,
  });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Quản lý Người thuê"
        description="Theo dõi thông tin, trạng thái và hợp đồng của tất cả Người thuê."
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              <Download />
              Xuất Excel
            </Button>
            <Link
              to={ROUTES.TENANT_CREATE}
              className={buttonVariants({ size: "sm" })}
            >
              <Plus />
              Thêm Người thuê
            </Link>
          </>
        }
      />

      {isLoading ? (
        <div className="space-y-6">
          <KpiStripSkeleton count={3} />
          <CardGridSkeleton itemCount={6} />
        </div>
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách Người thuê."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <KpiStrip
            items={summaryTiles.map((tile) => ({
              label: tile.label,
              value: countByStatus(data ?? [], tile.status),
            }))}
          />

          <DataTable
            columns={tenantColumns}
            data={data ?? []}
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
            empty={{
              icon: Users,
              title: "Không tìm thấy Người thuê",
              description:
                "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
            }}
            resultLabel={(count) => `${count} Người thuê được tìm thấy`}
            viewSwitch={<ListViewSwitch view={view} onViewChange={setView} />}
            renderRows={
              view === "grid"
                ? (tenants) => (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {tenants.map((tenant) => (
                        <TenantCard key={tenant.id} tenant={tenant} />
                      ))}
                    </div>
                  )
                : undefined
            }
          />
        </>
      )}
    </div>
  );
}
