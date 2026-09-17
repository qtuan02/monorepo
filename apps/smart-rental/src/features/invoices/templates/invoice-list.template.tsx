import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Plus,
} from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";

import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import {
  ListViewSwitch,
  ListViewTabs,
  useListView,
} from "~/components/data-table/list-view";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { invoiceStatusConfig, toFilterOptions } from "~/constants/status";
import InvoiceCard from "~/features/invoices/components/invoice-card";
import { invoiceColumns } from "~/features/invoices/components/invoice-columns";
import { buildInvoiceSummaryStats } from "~/features/invoices/utils/invoice-calculations";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

/**
 * "Quản lý hoá đơn": four KPI tiles over the list composite, cards or table
 * by `?view=`. "Xuất Excel" has no flow yet, as in the prototype; "Tạo hoá
 * đơn" leads to the Đợt hoá đơn screen, the one create flow the prototype had.
 */
export default function InvoiceListTemplate() {
  const [view, setView] = useListView();
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetInvoices({
    buildingId: selectedBuildingId,
  });

  const stats = buildInvoiceSummaryStats(data ?? []);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Quản lý hoá đơn"
        description="Theo dõi và quản lý tất cả hoá đơn thanh toán từ Người thuê."
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              <Download />
              Xuất Excel
            </Button>
            <Link
              to={ROUTES.INVOICE_BATCH}
              className={buttonVariants({ size: "sm" })}
            >
              <Plus />
              Tạo hoá đơn
            </Link>
          </>
        }
      />

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách hoá đơn."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Tổng hoá đơn"
              value={stats.total}
              icon={FileText}
            />
            <SummaryCard
              label="Đã thanh toán"
              value={formatCurrency(stats.paidAmount)}
              icon={CheckCircle2}
              iconClassName="bg-success/10 text-success"
            />
            <SummaryCard
              label="Chờ thanh toán"
              value={formatCurrency(stats.pendingAmount)}
              icon={Clock}
              iconClassName="bg-info/10 text-info"
            />
            <SummaryCard
              label="Quá hạn"
              value={formatCurrency(stats.overdueAmount)}
              icon={AlertCircle}
              iconClassName="bg-destructive/10 text-destructive"
            />
          </div>

          <ListViewTabs view={view} onViewChange={setView}>
            <DataTable
              columns={invoiceColumns}
              data={data ?? []}
              getRowId={(invoice) => invoice.id}
              search={{
                columnId: "invoiceNumber",
                placeholder: "Tìm số hoá đơn...",
              }}
              facets={[
                {
                  columnId: "status",
                  title: "Trạng thái",
                  options: toFilterOptions(invoiceStatusConfig),
                },
              ]}
              empty={{
                icon: FileText,
                title: "Không tìm thấy hoá đơn",
                description:
                  "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
              }}
              resultLabel={(count) => `${count} hoá đơn được tìm thấy`}
              viewSwitch={<ListViewSwitch />}
              renderRows={
                view === "grid"
                  ? (invoices) => (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {invoices.map((invoice) => (
                          <InvoiceCard key={invoice.id} invoice={invoice} />
                        ))}
                      </div>
                    )
                  : undefined
              }
            />
          </ListViewTabs>
        </>
      )}
    </div>
  );
}
