import { useState } from "react";
import { Bell, Download, FileText, Plus } from "lucide-react";
import { Link } from "react-router";

import dayjs from "@monorepo/dayjs";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { toast } from "@monorepo/ui/components/toast";

import type { Invoice } from "~/types/invoice";
import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import SendReminderDialog from "~/components/dialog/send-reminder-dialog";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ROUTES } from "~/constants/routes";
import { invoiceStatusConfig, toFilterOptions } from "~/constants/status";
import InvoiceCard from "~/features/invoices/components/invoice-card";
import { invoiceColumns } from "~/features/invoices/components/invoice-columns";
import InvoiceMobileRow from "~/features/invoices/components/invoice-mobile-row";
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
 * the table itself is showing. "Tạo hoá đơn" leads to the current Kỳ screen
 * (ADR-0013).
 */
export default function InvoiceListTemplate() {
  const [reminderRequest, setReminderRequest] = useState<{
    invoiceIds: string[];
    clearSelection: () => void;
  } | null>(null);
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const invoicesQuery = useGetInvoices({ buildingId: selectedBuildingId });

  const stats = buildInvoiceSummaryStats(invoicesQuery.data ?? []);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Hoá đơn"
        description="Theo dõi thanh toán và công nợ."
        actions={
          <Link
            to={ROUTES.cycleDetailPath(dayjs().format("YYYY-MM"))}
            className={buttonVariants({ size: "sm" })}
          >
            <Plus />
            Tạo hoá đơn
          </Link>
        }
        mobileAction={
          <Link
            to={ROUTES.cycleDetailPath(dayjs().format("YYYY-MM"))}
            aria-label="Tạo hoá đơn"
            className={buttonVariants({ size: "icon-sm" })}
          >
            <Plus />
          </Link>
        }
      />

      {invoicesQuery.isLoading ? (
        <KpiStripSkeleton />
      ) : (
        !invoicesQuery.isError && (
          <KpiStrip
            items={[
              { label: "Đã thu", value: formatCurrency(stats.paidAmount) },
              {
                label: "Chưa đến hạn",
                value: formatCurrency(stats.unpaidAmount),
              },
              { label: "Quá hạn", value: formatCurrency(stats.overdueAmount) },
              {
                label: "Thu một phần",
                value: formatCurrency(stats.partialAmount),
              },
            ]}
          />
        )
      )}

      <DataTable
        columns={invoiceColumns}
        query={invoicesQuery}
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
        empty={{ icon: FileText, title: "Không tìm thấy hoá đơn" }}
        entityLabel="hoá đơn"
        defaultSort={{ columnId: "dueDate" }}
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
        card={(invoice) => <InvoiceCard invoice={invoice} />}
        renderMobileRow={(invoice) => <InvoiceMobileRow invoice={invoice} />}
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
