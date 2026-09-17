import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { ComplianceItem, ComplianceType } from "~/types/compliance";
import { StatusBadge } from "~/components/badge/status-badge";
import {
  complianceStatusConfig,
  complianceTypeConfig,
} from "~/constants/status";

interface ComplianceTypeCardProps {
  type: ComplianceType;
  items: ComplianceItem[];
  emptyText: string;
}

/** The items of one kind — "Khai báo nơi ở", "Kiểm tra an toàn" — each with its status badge. */
export default function ComplianceTypeCard({
  type,
  items,
  emptyText,
}: ComplianceTypeCardProps) {
  const rows = items.filter((item) => item.type === type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {complianceTypeConfig[type].label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length > 0 ? (
          rows.map((item) => (
            <div
              key={item.id}
              className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{item.tenant}</p>
                <p className="text-muted-foreground text-xs">{item.room}</p>
              </div>
              <StatusBadge
                config={complianceStatusConfig[item.status]}
                isCompact
              />
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}
