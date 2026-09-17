import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import dayjs from "@monorepo/dayjs";
import { Alert, AlertDescription } from "@monorepo/ui/components/alert";
import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Checkbox } from "@monorepo/ui/components/checkbox";
import { FieldError } from "@monorepo/ui/components/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";
import { toast } from "@monorepo/ui/components/toast";

import type { BatchInvoiceFormValues } from "~/features/invoices/types/batch-invoice-form";
import type { PriceList } from "~/types/building";
import type { BatchInvoiceRow } from "~/utils/invoice-batch";
import { MonthField } from "~/components/form/month-field";
import { ListPageHeader } from "~/components/page/list-page-header";
import { BuildingScopeRequiredPanel } from "~/components/panel/building-scope-required-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { batchInvoiceFormSchema } from "~/features/invoices/types/batch-invoice-form";
import { useGetBuilding } from "~/hooks/api/building";
import {
  useCreateBatchInvoices,
  useGetBatchInvoiceRows,
} from "~/hooks/api/invoice";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { buildBatchInvoiceLineItems } from "~/utils/invoice-batch";

const FORM_ID = "batch-invoice-form";

function rowTotal(row: BatchInvoiceRow, priceList: PriceList): number {
  return buildBatchInvoiceLineItems(
    row,
    { priceList },
    row.electricityConsumption ?? 0,
    row.waterConsumption ?? 0,
  ).reduce((sum, item) => sum + item.amount, 0);
}

interface BatchInvoiceFormProps {
  buildingId: string;
  month: string;
  rows: BatchInvoiceRow[];
  priceList: PriceList;
}

/**
 * The tick table for one Toà nhà + kỳ, remounted (via the parent's `key`)
 * whenever either changes — a fresh mount is what gives it fresh
 * `defaultValues` off the just-fetched `rows` (see `meter-input.template.tsx`'s
 * own note on this shape).
 */
function BatchInvoiceForm({
  buildingId,
  month,
  rows,
  priceList,
}: BatchInvoiceFormProps) {
  const createBatchInvoices = useCreateBatchInvoices();
  const eligibleIds = rows
    .filter((row) => row.eligible)
    .map((row) => row.contractId);
  const form = useForm<BatchInvoiceFormValues>({
    resolver: zodResolver(batchInvoiceFormSchema),
    defaultValues: { month, selectedContractIds: eligibleIds },
  });
  const selectedIds = useWatch({
    control: form.control,
    name: "selectedContractIds",
  });
  const isAllSelected =
    eligibleIds.length > 0 && selectedIds.length === eligibleIds.length;

  const toggle = (contractId: string) =>
    form.setValue(
      "selectedContractIds",
      selectedIds.includes(contractId)
        ? selectedIds.filter((id) => id !== contractId)
        : [...selectedIds, contractId],
      { shouldValidate: form.formState.isSubmitted },
    );

  const onSubmit = form.handleSubmit((values) => {
    createBatchInvoices.mutate(
      { buildingId, month, contractIds: values.selectedContractIds },
      {
        onSuccess: (created) => {
          toast.add({
            title: `Đã tạo ${created.length} hoá đơn`,
            type: "success",
          });
        },
      },
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          form={FORM_ID}
          disabled={selectedIds.length === 0 || createBatchInvoices.isPending}
        >
          <Send />
          {createBatchInvoices.isPending
            ? "Đang tạo…"
            : `Tạo & Gửi ${selectedIds.length} hoá đơn`}
        </Button>
      </div>

      <form id={FORM_ID} onSubmit={onSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Xem trước danh sách hoá đơn</CardTitle>
            <CardDescription>
              Chỉ Phòng có Hợp đồng hiệu lực và Chỉ số đã xác nhận của kỳ mới
              lập được.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      aria-label="Chọn tất cả"
                      checked={isAllSelected}
                      indeterminate={selectedIds.length > 0 && !isAllSelected}
                      disabled={eligibleIds.length === 0}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          "selectedContractIds",
                          checked ? eligibleIds : [],
                          { shouldValidate: form.formState.isSubmitted },
                        )
                      }
                    />
                  </TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Người thuê</TableHead>
                  <TableHead>Tiền phòng</TableHead>
                  <TableHead className="text-right">Tổng cộng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.contractId}>
                    <TableCell>
                      <Checkbox
                        aria-label={`Chọn phòng ${row.room}`}
                        checked={selectedIds.includes(row.contractId)}
                        disabled={!row.eligible}
                        onCheckedChange={() => toggle(row.contractId)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{row.room}</TableCell>
                    <TableCell>{row.tenant}</TableCell>
                    <TableCell>{formatCurrency(row.rentAmount)}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {row.eligible
                        ? formatCurrency(rowTotal(row, priceList))
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {row.alreadyInvoiced ? (
                        <span className="text-muted-foreground text-xs">
                          Đã lập kỳ này
                        </span>
                      ) : !row.eligible ? (
                        <span className="text-destructive text-xs">
                          Chưa đủ điều kiện
                        </span>
                      ) : (
                        <span className="text-success text-xs">Sẵn sàng</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {form.formState.errors.selectedContractIds && (
              <FieldError
                className="px-6 py-4"
                errors={[form.formState.errors.selectedContractIds]}
              />
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

interface MonthFormValues {
  month: string;
}

interface BatchInvoiceRowsSectionProps {
  buildingId: string;
  month: string;
}

function BatchInvoiceRowsSection({
  buildingId,
  month,
}: BatchInvoiceRowsSectionProps) {
  const rowsQuery = useGetBatchInvoiceRows(buildingId, month);
  const buildingQuery = useGetBuilding(buildingId);

  if (rowsQuery.isLoading || buildingQuery.isLoading) {
    return <CardGridSkeleton itemCount={1} />;
  }
  if (!buildingQuery.data) return null;

  const rows = rowsQuery.data ?? [];
  if (rows.length === 0) {
    return (
      <Alert>
        <AlertCircle />
        <AlertDescription>
          Toà nhà này chưa có Hợp đồng hiệu lực nào.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <BatchInvoiceForm
      key={`${buildingId}-${month}`}
      buildingId={buildingId}
      month={month}
      rows={rows}
      priceList={buildingQuery.data.priceList}
    />
  );
}

/**
 * "Tạo hoá đơn hàng loạt" — an Đợt hoá đơn (spec #153 §10 row 12): chọn kỳ,
 * bảng tick chỉ cho Phòng có Hợp đồng hiệu lực và Chỉ số xác nhận của kỳ,
 * lập tạo Hoá đơn với dòng tiền phòng + điện/nước × Bảng giá + dịch vụ cố
 * định, hạn thu = ngày thu của Toà nhà. Kỳ đã lập không lập lại.
 */
export default function BatchInvoiceTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const monthForm = useForm<MonthFormValues>({
    defaultValues: { month: dayjs().format("YYYY-MM") },
  });
  const month = useWatch({ control: monthForm.control, name: "month" });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Tạo hoá đơn hàng loạt"
        description="Lập hoá đơn cho mọi phòng đang thuê trong một kỳ."
      />

      <div className="max-w-xs">
        <MonthField
          control={monthForm.control}
          name="month"
          label="Kỳ hoá đơn"
          required
        />
      </div>

      {!selectedBuildingId ? (
        <BuildingScopeRequiredPanel description="Đợt hoá đơn áp dụng cho đúng một Toà nhà — chọn Toà nhà ở thanh phía trên." />
      ) : (
        <BatchInvoiceRowsSection
          buildingId={selectedBuildingId}
          month={month}
        />
      )}
    </div>
  );
}
