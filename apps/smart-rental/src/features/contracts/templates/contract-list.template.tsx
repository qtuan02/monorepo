import { Download, FileText, LayoutGrid, List, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@monorepo/ui/components/tabs";

import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { contractStatusConfig, toFilterOptions } from "~/constants/status";
import ContractCard from "~/features/contracts/components/contract-card";
import { contractColumns } from "~/features/contracts/components/contract-columns";
import { useGetContracts } from "~/hooks/api/contract";
import { useBuildingStore } from "~/stores/use-building-store";

const VIEW_PARAM = "view";
type View = "grid" | "table";

/**
 * "Quản lý hợp đồng": the list composite over the scoped Mock, card/table
 * view on the URL. "Xuất Excel" has no flow yet, as in the prototype.
 */
export default function ContractListTemplate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: View =
    searchParams.get(VIEW_PARAM) === "table" ? "table" : "grid";
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetContracts({
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
        title="Quản lý hợp đồng"
        description="Theo dõi toàn bộ hợp đồng thuê trọ, thời hạn và trạng thái."
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              <Download />
              Xuất Excel
            </Button>
            <Link
              to={ROUTES.CONTRACT_CREATE}
              className={buttonVariants({ size: "sm" })}
            >
              <Plus />
              Thêm hợp đồng
            </Link>
          </>
        }
      />

      {isLoading ? (
        <LoadingPanel itemCount={6} />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách hợp đồng."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <Tabs value={view} onValueChange={(value) => setView(value as View)}>
          <DataTable
            columns={contractColumns}
            data={data ?? []}
            getRowId={(contract) => contract.id}
            search={{
              columnId: "contractNumber",
              placeholder: "Tìm số hợp đồng...",
            }}
            facets={[
              {
                columnId: "status",
                title: "Trạng thái",
                options: toFilterOptions(contractStatusConfig),
              },
            ]}
            empty={{
              icon: FileText,
              title: "Không tìm thấy hợp đồng",
              description:
                "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
            }}
            resultLabel={(count) => `${count} hợp đồng được tìm thấy`}
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
                ? (contracts) => (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {contracts.map((contract) => (
                        <ContractCard key={contract.id} contract={contract} />
                      ))}
                    </div>
                  )
                : undefined
            }
          />
        </Tabs>
      )}
    </div>
  );
}
