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
        <CardTitle className="flex items-center gap-2 text-base">
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

export function InfoRow({ label, value, isHighlighted }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={cn(
          "text-right text-sm font-medium",
          isHighlighted && "font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}
