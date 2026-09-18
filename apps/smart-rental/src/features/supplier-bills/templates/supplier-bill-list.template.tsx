import { useState } from "react";
import { Plus, Receipt } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { TableSkeleton } from "~/components/panel/loading-panel";
import {
  supplierBillPaymentConfig,
  supplierBillTypeConfig,
  toDistinctOptions,
  toFilterOptions,
} from "~/constants/status";
import { supplierBillColumns } from "~/features/supplier-bills/components/supplier-bill-columns";
import SupplierBillFormSheet from "~/features/supplier-bills/components/supplier-bill-form-sheet";
import { getSupplierBillTotals } from "~/features/supplier-bills/utils/supplier-bill-payment";
import { useGetSupplierBills } from "~/hooks/api/supplier-bill";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

/**
 * "Hoá đơn nhà cung cấp": the three KPIs over the scoped list, then the
 * table.
 */
export default function SupplierBillListTemplate() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetSupplierBills({
    buildingId: selectedBuildingId,
  });
  const bills = data ?? [];
  const totals = getSupplierBillTotals(bills);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Hoá đơn nhà cung cấp"
        description="Theo dõi và quản lý các khoản chi trả cho dịch vụ đầu vào."
        actions={
          <Button type="button" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus />
            Thêm hoá đơn
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-6">
          <KpiStripSkeleton count={3} />
          <TableSkeleton />
        </div>
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách hoá đơn nhà cung cấp."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <KpiStrip
            items={[
              { label: "Tổng chi", value: formatCurrency(totals.totalAmount) },
              {
                label: "Chờ thanh toán",
                value: formatCurrency(totals.pendingAmount),
              },
              { label: "Số hoá đơn", value: totals.count },
            ]}
          />

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
                title: "Kỳ hoá đơn",
                // Latest period first — `YYYY-MM` sorts as text.
                options: toDistinctOptions(
                  bills
                    .map((bill) => bill.billingPeriod)
                    .sort()
                    .reverse(),
                ),
              },
              {
                columnId: "paymentStatus",
                title: "Trạng thái",
                options: toFilterOptions(supplierBillPaymentConfig),
              },
            ]}
            empty={{
              icon: Receipt,
              title: "Không tìm thấy hoá đơn nhà cung cấp",
              description:
                "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
            }}
            resultLabel={(count) => `${count} hoá đơn được tìm thấy`}
          />
        </>
      )}

      <SupplierBillFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        defaultBuildingId={selectedBuildingId}
      />
    </div>
  );
}
