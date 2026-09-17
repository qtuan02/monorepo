interface ExpenseDetailTemplateProps {
  expenseId: string;
}

// Placeholder until the slice is ported: heading + the id the route resolved.
export default function ExpenseDetailTemplate({
  expenseId,
}: ExpenseDetailTemplateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Chi tiết chi phí</h1>
      <p className="text-muted-foreground text-sm">{expenseId}</p>
    </div>
  );
}
