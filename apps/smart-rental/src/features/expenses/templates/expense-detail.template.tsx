import { FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import { InfoCard, InfoRow } from "~/components/card/info-card";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { useGetExpense } from "~/hooks/api/expense";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";

interface ExpenseDetailTemplateProps {
  expenseId: string;
}

const TITLE = "Chi tiết chi phí";

/**
 * "Chi tiết chi phí": the amount, the facts, and the receipt image when the
 * record carries one (the Mock has none yet).
 */
export default function ExpenseDetailTemplate({
  expenseId,
}: ExpenseDetailTemplateProps) {
  const { data: expense, isLoading } = useGetExpense(expenseId);

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.EXPENSES}>
        <LoadingPanel itemCount={2} />
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

  return (
    <DetailPageShell title={TITLE} backTo={ROUTES.EXPENSES}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{expense.category}</CardTitle>
          {expense.description && (
            <CardDescription>{expense.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">
            {formatCurrency(expense.amount)}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Thông tin chi phí">
          <InfoRow label="Mã khoản chi" value={expense.id} />
          <InfoRow label="Tòa nhà" value={expense.buildingName} />
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
          {expense.receiptImageUrl ? (
            <img
              src={expense.receiptImageUrl}
              alt={`Biên lai ${expense.category} ngày ${formatDate(expense.expenseDate)}`}
              className="w-full rounded-lg border object-contain"
            />
          ) : (
            <p className="text-muted-foreground text-sm italic">
              Chưa có ảnh biên lai.
            </p>
          )}
        </InfoCard>
      </div>
    </DetailPageShell>
  );
}
