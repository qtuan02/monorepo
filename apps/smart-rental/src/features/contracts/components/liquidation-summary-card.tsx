import { Badge } from "@monorepo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

import { formatCurrency } from "~/utils/currency";

export interface LiquidationSummary {
  depositAmount: number;
  outstandingFees: number;
  penaltyAmount: number;
}

interface LiquidationSummaryCardProps {
  summary: LiquidationSummary;
}

/** Step 2 of a Thanh lý: deposit minus what is owed, and which way the balance goes. */
export default function LiquidationSummaryCard({
  summary,
}: LiquidationSummaryCardProps) {
  const balance =
    summary.depositAmount - summary.outstandingFees - summary.penaltyAmount;
  const isRefund = balance > 0;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-base">Tóm tắt thanh toán</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SummaryLine
          label="Tiền đặt cọc"
          value={formatCurrency(summary.depositAmount)}
          className="text-emerald-600"
        />
        {summary.outstandingFees > 0 && (
          <SummaryLine
            label="Công nợ chưa thanh toán"
            value={`-${formatCurrency(summary.outstandingFees)}`}
            className="text-destructive"
          />
        )}
        {summary.penaltyAmount > 0 && (
          <SummaryLine
            label="Phí vi phạm"
            value={`-${formatCurrency(summary.penaltyAmount)}`}
            className="text-destructive"
          />
        )}
        <div className="flex items-center justify-between rounded-lg border-t bg-linear-to-r from-blue-100 to-blue-50 p-3 pt-4">
          <p className="text-sm font-medium">Hoàn lại cho khách</p>
          <div className="text-right">
            <p
              className={cn(
                "text-xl font-bold",
                isRefund ? "text-emerald-600" : "text-destructive",
              )}
            >
              {isRefund ? "+" : ""}
              {formatCurrency(balance)}
            </p>
            <Badge
              variant="outline"
              className={
                isRefund
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }
            >
              {isRefund ? "Phải hoàn lại" : "Còn nợ"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryLine({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="bg-card flex items-center justify-between rounded-lg p-3">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className={cn("text-lg font-semibold", className)}>{value}</p>
    </div>
  );
}
