import { useParams } from "react-router";

import ExpenseDetailTemplate from "~/features/expenses/templates/expense-detail.template";

export default function ExpenseDetailPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { expenseId } = useParams() as { expenseId: string };

  return <ExpenseDetailTemplate expenseId={expenseId} />;
}
