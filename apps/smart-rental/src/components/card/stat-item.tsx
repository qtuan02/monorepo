import type { ReactNode } from "react";

import { cn } from "@monorepo/ui/utils/cn";

interface StatItemProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

/** One figure under a small uppercase label — a `<dt>`/`<dd>` pair, so it sits in a `<dl>`. */
export function StatItem({ label, value, valueClassName }: StatItemProps) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        {label}
      </dt>
      <dd className={cn("mt-1.5 text-base font-semibold", valueClassName)}>
        {value}
      </dd>
    </div>
  );
}
