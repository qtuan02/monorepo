import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { ComplianceItem } from "~/types/compliance";
import { StatusBadge } from "~/components/badge/status-badge";
import {
  complianceStatusConfig,
  complianceTypeConfig,
} from "~/constants/status";

interface ResidenceChecklistCardProps {
  items: ComplianceItem[];
}

/** "Danh sách khai báo lưu trú theo Người thuê": every item, with its kind, status and the date that matters. */
export default function ResidenceChecklistCard({
  items,
}: ResidenceChecklistCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Danh sách khai báo lưu trú theo Người thuê
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="hover:bg-muted/50 flex items-start justify-between gap-3 rounded-lg border p-4 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.tenant}</p>
              <p className="text-muted-foreground mt-1 text-xs">{item.room}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {complianceTypeConfig[item.type].label}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <StatusBadge config={complianceStatusConfig[item.status]} />
              <p className="text-muted-foreground mt-2 text-xs">
                {item.status === "completed"
                  ? `Hoàn thành: ${item.completedDate}`
                  : `Hạn: ${item.dueDate}`}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
