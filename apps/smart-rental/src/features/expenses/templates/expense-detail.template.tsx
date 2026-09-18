import { useState } from "react";
import { Edit, FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import { toast } from "@monorepo/ui/components/toast";

import { ReceiptAttachment } from "~/components/attachment/receipt-attachment";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { DetailSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import ExpenseFormSheet from "~/features/expenses/components/expense-form-sheet";
import { useDeleteExpense, useGetExpense } from "~/hooks/api/expense";
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
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: expense, isLoading } = useGetExpense(expenseId);
  const deleteExpense = useDeleteExpense();

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.EXPENSES}>
        <DetailSkeleton />
      </DetailPageShell>
    );
  }

  if (!expense) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.EXPENSES}>
        <EmptyPanel
          icon={FileText}
          title="Không tìm thấy khoản chi phí."
          description={`Không có khoản chi nào với mã ${expenseId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const handleDelete = () =>
    deleteExpense.mutate(expense.id, {
      onSuccess: () => {
        toast.add({ title: "Đã xóa khoản chi", type: "success" });
        setIsDeleteOpen(false);
        navigate(ROUTES.EXPENSES, { replace: true });
      },
    });

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
              onClick={() => setIsDeleteOpen(true)}
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

      <ConfirmActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa khoản chi"
        description={`Bạn có chắc chắn muốn xóa khoản chi "${expense.category}" không? Hành động này không thể hoàn tác.`}
        actionLabel="Xóa"
        variant="destructive"
        isPending={deleteExpense.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
