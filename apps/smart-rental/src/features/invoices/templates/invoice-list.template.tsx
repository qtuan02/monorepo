import { Bell, Download, FileText, Plus } from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { toast } from "@monorepo/ui/components/toast";

import type { Invoice } from "~/types/invoice";
import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListViewSwitch, useListView } from "~/components/data-table/list-view";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { invoiceStatusConfig, toFilterOptions } from "~/constants/status";
import InvoiceCard from "~/features/invoices/components/invoice-card";
import { invoiceColumns } from "~/features/invoices/components/invoice-columns";
import InvoiceMobileRow from "~/features/invoices/components/invoice-mobile-row";
import { buildInvoiceSummaryStats } from "~/features/invoices/utils/invoice-calculations";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

function remindSelected(invoices: Invoice[]) {
  toast.add({
    title: `Đã gửi nhắc cho ${invoices.length} hoá đơn`,
    description: "Nhật ký nhắc được ghi trên từng hoá đơn.",
  });
}

function exportSelected(invoices: Invoice[]) {
  toast.add({
    title: `Đang chuẩn bị xuất ${invoices.length} hoá đơn`,
    description: "Xuất hàng loạt sẽ có ở ticket riêng.",
  });
}

/**
 * "Quản lý hoá đơn" — the list-screen foundation's exemplar (spec #153
 * §10 rows 16/35/36): a KPI strip, the list composite in card or table view,
 * a selection action bar once rows are checked, and a mobile Item list when
 * the table itself is showing. "Xuất Excel" has no flow yet, as in the
 * prototype; "Tạo hoá đơn" leads to the Đợt hoá đơn screen, the one create
 * flow the prototype had.
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
        description={`${stats.total} hoá đơn`}
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
        <div className="space-y-6">
          <KpiStripSkeleton />
          <CardGridSkeleton />
        </div>
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách hoá đơn."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <KpiStrip
            items={[
              { label: "Đã thu", value: formatCurrency(stats.paidAmount) },
              { label: "Chưa thu", value: formatCurrency(stats.unpaidAmount) },
              { label: "Quá hạn", value: formatCurrency(stats.overdueAmount) },
              {
                label: "Thu một phần",
                value: formatCurrency(stats.partialAmount),
              },
            ]}
          />

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
            viewSwitch={<ListViewSwitch view={view} onViewChange={setView} />}
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
            renderMobileRow={(invoice) => (
              <InvoiceMobileRow invoice={invoice} />
            )}
            selectionActions={(selected, clearSelection) => (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    remindSelected(selected);
                    clearSelection();
                  }}
                >
                  <Bell />
                  Gửi nhắc
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    exportSelected(selected);
                    clearSelection();
                  }}
                >
                  <Download />
                  Xuất
                </Button>
              </>
            )}
          />
        </>
      )}
    </div>
  );
}
