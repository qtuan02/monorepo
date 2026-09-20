import { Calendar, DoorOpen } from "lucide-react";

import {
  CardContent,
  CardFooter,
  CardHeader,
} from "@monorepo/ui/components/card";

import type { Invoice } from "~/types/invoice";
import { StatusBadge } from "~/components/badge/status-badge";
import { EntityListCard } from "~/components/card/entity-list-card";
import { StatItem } from "~/components/card/stat-item";
import { formatCurrency } from "~/utils/currency";
import { formatDate, formatMonth } from "~/utils/date";
import { invoiceStatusBadgeConfig } from "~/utils/invoice-status";
import InvoiceRowActions from "./invoice-row-actions";

interface InvoiceCardProps {
  invoice: Invoice;
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <EntityListCard
      header={
        <CardHeader>
          <h3 className="truncate text-sm font-semibold">
            {invoice.invoiceNumber}
          </h3>
          <p className="text-muted-foreground text-xs">
            {formatMonth(invoice.billingMonth)}
          </p>
        </CardHeader>
      }
      content={
        <CardContent className="space-y-3">
          <StatusBadge config={invoiceStatusBadgeConfig(invoice)} />
          <div className="bg-muted/50 space-y-2 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Người thuê
              </span>
              <span className="font-medium">{invoice.tenant}</span>
            </div>
            <div className="bg-border h-px" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Phòng
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <DoorOpen className="size-3" />
                {invoice.room}
              </span>
            </div>
          </div>
          <dl className="bg-primary/5 grid gap-2 rounded-lg p-2.5 sm:grid-cols-2">
            <StatItem
              label="Số tiền"
              value={formatCurrency(invoice.amount)}
              valueClassName="text-sm font-bold tabular-nums"
            />
            <StatItem
              label="Hạn thanh toán"
              value={formatDate(invoice.dueDate)}
              valueClassName="text-muted-foreground text-sm tabular-nums"
            />
          </dl>
        </CardContent>
      }
      footer={
        <CardFooter className="text-muted-foreground justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3" />
            Cập nhật: {formatDate(invoice.lastUpdated)}
          </span>
          <InvoiceRowActions invoice={invoice} side="top" />
        </CardFooter>
      }
    />
  );
}
