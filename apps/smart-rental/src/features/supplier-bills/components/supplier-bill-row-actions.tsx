import { Eye } from "lucide-react";

import type { SupplierBill } from "~/types/supplier-bill";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import { ROUTES } from "~/constants/routes";

interface SupplierBillRowActionsProps {
  supplierBill: SupplierBill;
  side?: "top" | "bottom";
}

/** The "⋯" of a Hoá đơn nhà cung cấp row. */
export default function SupplierBillRowActions({
  supplierBill,
  side = "bottom",
}: SupplierBillRowActionsProps) {
  return (
    <EntityActionMenu
      side={side}
      items={[
        {
          key: "detail",
          label: "Xem chi tiết",
          icon: <Eye />,
          link: ROUTES.supplierBillDetailPath(supplierBill.id),
        },
      ]}
    />
  );
}
