import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
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
import { invoiceStatusConfig, toFilterOptions } from "~/constants/status";
import InvoiceCard from "~/features/invoices/components/invoice-card";
import { invoiceColumns } from "~/features/invoices/components/invoice-columns";
import { buildInvoiceSummaryStats } from "~/features/invoices/utils/invoice-calculations";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

const VIEW_PARAM = "view";
type View = "grid" | "table";

/**
 * "Quản lý hóa đơn": four KPI tiles over the list composite, cards or table
 * by `?view=`. "Xuất Excel" has no flow yet, as in the prototype; "Tạo hóa
 * đơn" leads to the Đợt hoá đơn screen, the one create flow the prototype had.
 */
export default function InvoiceListTemplate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: View =
    searchParams.get(VIEW_PARAM) === "table" ? "table" : "grid";
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetInvoices({
    buildingId: selectedBuildingId,
  });

  const stats = buildInvoiceSummaryStats(data ?? []);

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
        title="Quản lý hóa đơn"
        description="Theo dõi và quản lý tất cả hóa đơn thanh toán từ khách thuê."
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
              Tạo hóa đơn
            </Link>
          </>
        }
      />

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách hóa đơn."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Tổng hóa đơn"
              value={stats.total}
              icon={FileText}
            />
            <SummaryCard
              label="Đã thanh toán"
              value={formatCurrency(stats.paidAmount)}
              icon={CheckCircle2}
              iconClassName="bg-emerald-50 text-emerald-700"
            />
            <SummaryCard
              label="Chờ thanh toán"
              value={formatCurrency(stats.pendingAmount)}
              icon={Clock}
              iconClassName="bg-blue-50 text-blue-700"
            />
            <SummaryCard
              label="Quá hạn"
              value={formatCurrency(stats.overdueAmount)}
              icon={AlertCircle}
              iconClassName="bg-red-50 text-red-700"
            />
          </div>

          <Tabs value={view} onValueChange={(value) => setView(value as View)}>
            <DataTable
              columns={invoiceColumns}
              data={data ?? []}
              getRowId={(invoice) => invoice.id}
              search={{
                columnId: "invoiceNumber",
                placeholder: "Tìm số hóa đơn...",
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
                title: "Không tìm thấy hóa đơn",
                description:
                  "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
              }}
              resultLabel={(count) => `${count} hóa đơn được tìm thấy`}
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
          </Tabs>
        </>
      )}
    </div>
  );
}
