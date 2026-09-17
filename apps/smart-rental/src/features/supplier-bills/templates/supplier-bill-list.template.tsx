import { Activity, Plus, Receipt } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import type { FilterOption } from "~/constants/status";
import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import {
  supplierBillPaymentConfig,
  supplierBillTypeConfig,
  toFilterOptions,
} from "~/constants/status";
import { supplierBillColumns } from "~/features/supplier-bills/components/supplier-bill-columns";
import { getSupplierBillTotals } from "~/features/supplier-bills/utils/supplier-bill-payment";
import { useGetSupplierBills } from "~/hooks/api/supplier-bill";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

/** The periods present in the scoped list, latest first — this facet has no fixed vocabulary. */
function periodOptions(periods: string[]): FilterOption[] {
  return [...new Set(periods)]
    .sort((a, b) => b.localeCompare(a))
    .map((period) => ({ label: period, value: period }));
}

/**
 * "Hóa đơn nhà cung cấp": the three KPIs over the scoped list, then the
 * table. "Thêm hóa đơn" has no flow yet, as in the prototype.
 */
export default function SupplierBillListTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetSupplierBills({
    buildingId: selectedBuildingId,
  });
  const bills = data ?? [];
  const totals = getSupplierBillTotals(bills);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Hóa đơn nhà cung cấp"
        description="Theo dõi và quản lý các khoản chi trả cho dịch vụ đầu vào."
        actions={
          <Button type="button" size="sm">
            <Plus />
            Thêm hóa đơn
          </Button>
        }
      />

      {isLoading ? (
        <LoadingPanel itemCount={6} />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách hóa đơn nhà cung cấp."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Tổng chi"
              value={formatCurrency(totals.totalAmount)}
              icon={Receipt}
            />
            <SummaryCard
              label="Chờ thanh toán"
              value={formatCurrency(totals.pendingAmount)}
              icon={Activity}
              iconClassName="bg-amber-100 text-amber-600"
            />
            <SummaryCard
              label="Số hóa đơn"
              value={totals.count}
              icon={Receipt}
            />
          </div>

          <DataTable
            columns={supplierBillColumns}
            data={bills}
            getRowId={(bill) => bill.id}
            search={{
              columnId: "supplierName",
              placeholder: "Tìm nhà cung cấp...",
            }}
            facets={[
              {
                columnId: "type",
                title: "Loại dịch vụ",
                options: toFilterOptions(supplierBillTypeConfig),
              },
              {
                columnId: "billingPeriod",
                title: "Kỳ hóa đơn",
                options: periodOptions(bills.map((bill) => bill.billingPeriod)),
              },
              {
                columnId: "paymentStatus",
                title: "Trạng thái",
                options: toFilterOptions(supplierBillPaymentConfig),
              },
            ]}
            empty={{
              icon: Receipt,
              title: "Không tìm thấy hóa đơn nhà cung cấp",
              description:
                "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
            }}
            resultLabel={(count) => `${count} hóa đơn được tìm thấy`}
          />
        </>
      )}
    </div>
  );
}
