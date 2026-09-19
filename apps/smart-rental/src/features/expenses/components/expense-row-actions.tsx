import { Eye } from "lucide-react";

import type { Expense } from "~/types/expense";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import { ROUTES } from "~/constants/routes";

interface ExpenseRowActionsProps {
  expense: Expense;
  side?: "top" | "bottom";
}

/** The "⋯" of a Chi phí row. */
export default function ExpenseRowActions({
  expense,
  side = "bottom",
}: ExpenseRowActionsProps) {
  return (
    <EntityActionMenu
      side={side}
      items={[
        {
          key: "detail",
          label: "Xem chi tiết",
          icon: <Eye />,
          link: ROUTES.expenseDetailPath(expense.id),
        },
      ]}
    />
  );
}
