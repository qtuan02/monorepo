import { ReceiptText } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";

import type { Invoice } from "~/types/invoice";
import { StatusBadge } from "~/components/badge/status-badge";
import { formatCurrency } from "~/utils/currency";
import { invoiceStatusBadgeConfig } from "~/utils/invoice-status";
import InvoiceRowActions from "./invoice-row-actions";

/** A Hoá đơn table row's mobile substitute — `renderMobileRow` on `DataTable`. */
export default function InvoiceMobileRow({ invoice }: { invoice: Invoice }) {
  return (
    <Item variant="outline" size="sm">
      <ItemMedia variant="icon">
        <ReceiptText />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{invoice.invoiceNumber}</ItemTitle>
        <ItemDescription>
          {invoice.tenant} · {invoice.room} · {formatCurrency(invoice.amount)}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <StatusBadge config={invoiceStatusBadgeConfig(invoice)} isCompact />
        <InvoiceRowActions invoice={invoice} />
      </ItemActions>
    </Item>
  );
}
