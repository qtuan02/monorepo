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

interface StatGroupProps {
  children: ReactNode;
  className?: string;
}

/**
 * The `<dl>` a row of `StatItem`s sits in — the one home for it (spec #153
 * §3.4/§4), so a card no longer hand-rolls `<dl className="grid …">` itself.
 */
export function StatGroup({ children, className }: StatGroupProps) {
  return (
    <dl className={cn("grid grid-cols-2 gap-6 sm:grid-cols-3", className)}>
      {children}
    </dl>
  );
}
