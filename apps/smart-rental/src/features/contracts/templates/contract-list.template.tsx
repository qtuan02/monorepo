import { FileText, Plus } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";

import { DataTable } from "~/components/data-table/data-table";
import { ListViewSwitch, useListView } from "~/components/data-table/list-view";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { contractStatusConfig, toFilterOptions } from "~/constants/status";
import ContractCard from "~/features/contracts/components/contract-card";
import { contractColumns } from "~/features/contracts/components/contract-columns";
import { useGetContracts } from "~/hooks/api/contract";
import { useBuildingStore } from "~/stores/use-building-store";

/**
 * "Quản lý hợp đồng": the list composite over the scoped Mock, card/table
 * view on the URL.
 */
export default function ContractListTemplate() {
  const [view, setView] = useListView();
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetContracts({
    buildingId: selectedBuildingId,
  });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Quản lý hợp đồng"
        description="Theo dõi toàn bộ hợp đồng thuê trọ, thời hạn và trạng thái."
        actions={
          <Link
            to={ROUTES.CONTRACT_CREATE}
            className={buttonVariants({ size: "sm" })}
          >
            <Plus />
            Thêm hợp đồng
          </Link>
        }
      />

      {isLoading ? (
        <CardGridSkeleton itemCount={6} />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách hợp đồng."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
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
          viewSwitch={<ListViewSwitch view={view} onViewChange={setView} />}
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
      )}
    </div>
  );
}
