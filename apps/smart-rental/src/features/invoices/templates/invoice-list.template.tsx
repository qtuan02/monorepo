import { useState } from "react";
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
import SendReminderDialog from "~/features/invoices/components/send-reminder-dialog";
import { buildInvoiceSummaryStats } from "~/features/invoices/utils/invoice-calculations";
import { buildInvoiceCsv } from "~/features/invoices/utils/invoice-export";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useBuildingStore } from "~/stores/use-building-store";
import { downloadCsv } from "~/utils/csv";
import { formatCurrency } from "~/utils/currency";

/** "Xuất CSV các hàng đang lọc" (spec #153 §10 row 12/13). */
function exportInvoicesCsv(invoices: Invoice[]) {
  if (invoices.length === 0) {
    toast.add({
      title: "Không có hoá đơn nào để xuất",
      description: "Thử đổi bộ lọc hoặc từ khóa tìm kiếm.",
    });
    return;
  }
  downloadCsv("hoa-don.csv", buildInvoiceCsv(invoices));
}

/**
 * "Quản lý hoá đơn" — the list-screen foundation's exemplar (spec #153
 * §10 rows 16/35/36): a KPI strip, the list composite in card or table view,
 * a selection action bar once rows are checked, and a mobile Item list when
 * the table itself is showing. "Tạo hoá đơn" leads to the Đợt hoá đơn screen.
 */
export default function InvoiceListTemplate() {
  const [view, setView] = useListView();
  const [reminderRequest, setReminderRequest] = useState<{
    invoiceIds: string[];
    clearSelection: () => void;
  } | null>(null);
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
          <Link
            to={ROUTES.INVOICE_BATCH}
            className={buttonVariants({ size: "sm" })}
          >
            <Plus />
            Tạo hoá đơn
          </Link>
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
            toolbarActions={(filteredInvoices) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => exportInvoicesCsv(filteredInvoices)}
              >
                <Download />
                Xuất CSV
              </Button>
            )}
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setReminderRequest({
                    invoiceIds: selected.map((invoice) => invoice.id),
                    clearSelection,
                  })
                }
              >
                <Bell />
                Gửi nhắc
              </Button>
            )}
          />
        </>
      )}

      {reminderRequest && (
        <SendReminderDialog
          open={!!reminderRequest}
          onOpenChange={(open) => {
            if (!open) setReminderRequest(null);
          }}
          invoiceIds={reminderRequest.invoiceIds}
          onSent={() => {
            reminderRequest.clearSelection();
            setReminderRequest(null);
          }}
        />
      )}
    </div>
  );
}
