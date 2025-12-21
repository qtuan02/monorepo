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
      <Package className="mb-4 size-12 text-gray-400" />
      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        No components found
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        The {category} category doesn't have any components yet.
      </p>
    </div>
  );
}

