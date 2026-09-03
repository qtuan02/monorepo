import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@monorepo/ui/libs/cn";

export interface BreadcrumbItem {
  label: string;
  path?: string;
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
              <ChevronRight className="text-muted-foreground mx-1 h-4 w-4" />
            )}
            {isClickable ? (
              <Link
                to={item.path!}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
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
