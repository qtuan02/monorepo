import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@monorepo/ui/libs/cn";

export interface BreadcrumbItem {
  label: string;
  path?: string; // undefined = current page (not clickable)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      data-testid="breadcrumb"
      className={cn("flex items-center space-x-1 text-sm", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = item.path && !isLast;

        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-1 h-4 w-4 text-gray-400" />
            )}
            {isClickable ? (
              <Link
                to={item.path!}
                className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast
                    ? "font-medium text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
