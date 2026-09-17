import {
  Download,
  LayoutGrid,
  List,
  Plus,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@monorepo/ui/components/tabs";

import type { TenantStatus, TenantView } from "~/types/tenant";
import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { tenantStatusConfig, toFilterOptions } from "~/constants/status";
import TenantCard from "~/features/tenants/components/tenant-card";
import { tenantColumns } from "~/features/tenants/components/tenant-columns";
import { useGetTenants } from "~/hooks/api/tenant";
import { useBuildingStore } from "~/stores/use-building-store";

const VIEW_PARAM = "view";
type View = "grid" | "table";

/** The four KPI tiles above the list; a `status` counts that status, none counts everything. */
const summaryTiles: {
  label: string;
  status?: TenantStatus;
  icon: typeof Users;
  iconClassName: string;
}[] = [
  {
    label: "Tổng Người thuê",
    icon: Users,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    label: "Đang thuê",
    status: "active",
    icon: UserCheck,
    iconClassName: "bg-success/10 text-success",
  },
  {
    label: "Đã rời",
    status: "ended",
    icon: UserX,
    iconClassName: "bg-muted text-muted-foreground",
  },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const view: View =
    searchParams.get(VIEW_PARAM) === "table" ? "table" : "grid";
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetTenants({
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
        <LoadingPanel itemCount={6} />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách Người thuê."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summaryTiles.map((tile) => (
              <SummaryCard
                key={tile.label}
                label={tile.label}
                value={countByStatus(data ?? [], tile.status)}
                icon={tile.icon}
                iconClassName={tile.iconClassName}
              />
            ))}
          </div>

          <Tabs value={view} onValueChange={(value) => setView(value as View)}>
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
          </Tabs>
        </>
      )}
    </div>
  );
}
