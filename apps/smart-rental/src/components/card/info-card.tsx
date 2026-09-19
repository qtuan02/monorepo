import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

interface InfoCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A titled card of label/value rows — a detail screen's "Thông tin …" block. */
export function InfoCard({ title, icon, children, className }: InfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px]">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

interface InfoRowProps {
  label: string;
  value: ReactNode;
  isHighlighted?: boolean;
}

/**
 * A `dt`/`dd` pair on a fixed 140px label column (round 4 Q8/mockup A4) — the
 * label sits right next to its value instead of the eye travelling flex-between
 * across the card's full width.
 */
export function InfoRow({ label, value, isHighlighted }: InfoRowProps) {
  return (
    <dl className="grid grid-cols-[140px_1fr] gap-x-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", isHighlighted && "font-semibold")}>
        {value}
      </dd>
    </dl>
  );
}
