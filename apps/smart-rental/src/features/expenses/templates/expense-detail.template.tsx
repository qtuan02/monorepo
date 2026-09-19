import { useState } from "react";
import { Edit, FileText, Trash2 } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import { ReceiptAttachment } from "~/components/attachment/receipt-attachment";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { ROUTES } from "~/constants/routes";
import ExpenseFormSheet from "~/features/expenses/components/expense-form-sheet";
import { useDeleteExpense, useGetExpense } from "~/hooks/api/expense";
import { useDeleteEntity } from "~/hooks/use-delete-entity";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";

interface ExpenseDetailTemplateProps {
  expenseId: string;
}

const TITLE = "Chi tiết chi phí";

/**
 * "Chi tiết chi phí" (spec #153 §10 row 35): header entity + facts, no tabs —
 * a Chi phí carries no relation worth its own panel. Xoá is unconditional
 * (§10 row 37 names no restriction for Chi phí) through the confirm dialog.
 */
export default function ExpenseDetailTemplate({
  expenseId,
}: ExpenseDetailTemplateProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const expenseQuery = useGetExpense(expenseId);
  const expense = expenseQuery.data;

  const deleteExpense = useDeleteEntity({
    mutation: useDeleteExpense(),
    id: expense?.id ?? "",
    label: "khoản chi",
    entity: expense?.category,
    successMessage: "Đã xóa khoản chi",
    redirectTo: ROUTES.EXPENSES,
  });

  if (!expense) {
    return (
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.EXPENSES}
        query={expenseQuery}
        id={expenseId}
        notFound={(id) => ({
          icon: FileText,
          title: "Không tìm thấy khoản chi phí.",
          description: `Không có khoản chi nào với mã ${id}.`,
        })}
      />
    );
  }

  return (
    <>
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.EXPENSES}
        name={expense.category}
        meta={[expense.buildingName, formatDate(expense.expenseDate)]}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit />
              Chỉnh sửa
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={deleteExpense.onOpen}
            >
              <Trash2 />
              Xóa
            </Button>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <InfoCard title="Thông tin chi phí">
            <InfoRow label="Mã khoản chi" value={expense.id} />
            <InfoRow label="Toà nhà" value={expense.buildingName} />
            <InfoRow label="Ngày chi" value={formatDate(expense.expenseDate)} />
            <InfoRow label="Danh mục" value={expense.category} />
            <InfoRow
              label="Số tiền"
              value={formatCurrency(expense.amount)}
              isHighlighted
            />
            <InfoRow label="Mô tả" value={expense.description ?? "—"} />
          </InfoCard>

          <InfoCard title="Ảnh biên lai">
            <ReceiptAttachment src={expense.receiptImageUrl} label="Biên lai" />
          </InfoCard>
        </div>
      </DetailPageShell>

      <ExpenseFormSheet
        expense={expense}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ConfirmActionDialog {...deleteExpense.dialogProps} />
    </>
  );
}
