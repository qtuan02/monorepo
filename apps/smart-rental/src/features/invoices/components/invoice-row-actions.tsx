import { Eye } from "lucide-react";

import type { Invoice } from "~/types/invoice";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import { ROUTES } from "~/constants/routes";

interface InvoiceRowActionsProps {
  invoice: Invoice;
  side?: "top" | "bottom";
}

/** The "⋯" of a Hoá đơn row or card. */
export default function InvoiceRowActions({
  invoice,
  side = "bottom",
}: InvoiceRowActionsProps) {
  return (
    <EntityActionMenu
      side={side}
      items={[
        {
          key: "detail",
          label: "Xem chi tiết",
          icon: <Eye />,
          link: ROUTES.invoiceDetailPath(invoice.id),
        },
      ]}
    />
  );
}
