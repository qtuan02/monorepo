import {
  Activity,
  AlertCircle,
  Clock,
  FileText,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@monorepo/ui/components/tabs";

import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import {
  toFilterOptions,
  utilityStatusConfig,
  utilityTypeConfig,
} from "~/constants/status";
import UtilityCard from "~/features/utilities/components/utility-card";
import { utilityColumns } from "~/features/utilities/components/utility-columns";
import { calculateUtilityStats } from "~/features/utilities/utils/meter-reading";
import { useGetUtilities } from "~/hooks/api/utility";
import { useBuildingStore } from "~/stores/use-building-store";

const VIEW_PARAM = "view";
type View = "grid" | "table";

/**
 * "Tiện ích" — the Chỉ số điện nước list (the heading keeps the prototype's
 * copy; the code keeps the glossary's name). Three KPI tiles over the list
 * composite, cards or table by `?view=`. "Lịch sử chốt" has no flow yet, as
 * in the prototype; "Thêm chỉ số" leads to the meter-input screen.
 */
export default function UtilityListTemplate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: View =
    searchParams.get(VIEW_PARAM) === "table" ? "table" : "grid";
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetUtilities({
    buildingId: selectedBuildingId,
  });

  const stats = calculateUtilityStats(data ?? []);

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
        title="Tiện ích"
        description="Quản lý chỉ số điện nước và tiêu thụ hàng tháng."
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              Lịch sử chốt
            </Button>
            <Link
              to={ROUTES.METER_INPUT}
              className={buttonVariants({ size: "sm" })}
            >
              <Plus />
              Thêm chỉ số
            </Link>
          </>
        }
      />

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách chỉ số."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              label="Tổng chỉ số"
              value={stats.totalReadings}
              icon={Activity}
            />
            <SummaryCard
              label="Bất thường"
              value={stats.anomalyCount}
              icon={AlertCircle}
              iconClassName="bg-red-50 text-red-700"
            />
            <SummaryCard
              label="Chờ xác minh"
              value={stats.pendingVerifyCount}
              icon={Clock}
              iconClassName="bg-blue-50 text-blue-700"
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          <Tabs value={view} onValueChange={(value) => setView(value as View)}>
            <DataTable
              columns={utilityColumns}
              data={data ?? []}
              getRowId={(utility) => utility.id}
              search={{ columnId: "roomName", placeholder: "Tìm tên phòng..." }}
              facets={[
                {
                  columnId: "status",
                  title: "Trạng thái",
                  options: toFilterOptions(utilityStatusConfig),
                },
                {
                  columnId: "type",
                  title: "Loại tiện ích",
                  options: toFilterOptions(utilityTypeConfig),
                },
              ]}
              empty={{
                icon: FileText,
                title: "Không có dữ liệu",
                description:
                  "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
              }}
              resultLabel={(count) => `${count} chỉ số được tìm thấy`}
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
                  ? (utilities) => (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {utilities.map((utility) => (
                          <UtilityCard key={utility.id} utility={utility} />
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
