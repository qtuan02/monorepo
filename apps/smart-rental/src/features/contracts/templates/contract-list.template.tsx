import { FileText, Plus } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";

import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ROUTES } from "~/constants/routes";
import { contractStatusConfig, toFilterOptions } from "~/constants/status";
import ContractCard from "~/features/contracts/components/contract-card";
import { contractColumns } from "~/features/contracts/components/contract-columns";
import ContractMobileRow from "~/features/contracts/components/contract-mobile-row";
import { useGetContracts } from "~/hooks/api/contract";
import { useBuildingStore } from "~/stores/use-building-store";

/**
 * "Quản lý hợp đồng": the list composite over the scoped Mock, card/table
 * view on the URL.
 */
export default function ContractListTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const contractsQuery = useGetContracts({ buildingId: selectedBuildingId });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Hợp đồng"
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
        mobileAction={
          <Link
            to={ROUTES.CONTRACT_CREATE}
            aria-label="Tạo hợp đồng"
            className={buttonVariants({ size: "icon-sm" })}
          >
            <Plus />
          </Link>
        }
      />

      <DataTable
        columns={contractColumns}
        query={contractsQuery}
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
        empty={{ icon: FileText, title: "Không tìm thấy hợp đồng" }}
        entityLabel="hợp đồng"
        defaultSort={{ columnId: "endDate" }}
        card={(contract) => <ContractCard contract={contract} />}
        renderMobileRow={(contract) => (
          <ContractMobileRow contract={contract} />
        )}
      />
    </div>
  );
}
