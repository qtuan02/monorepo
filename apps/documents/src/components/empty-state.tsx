import { Package } from "lucide-react";

interface EmptyStateProps {
  category: string;
}

export default function EmptyState({ category }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      data-testid="empty-state"
    >
      <Package className="text-muted-foreground mb-4 size-12" />
      <h2 className="text-foreground mb-2 text-xl font-semibold">
        No components found
      </h2>
      <p className="text-muted-foreground">
        The {category} category doesn&apos;t have any components yet.
      </p>
    </div>
  );
}
