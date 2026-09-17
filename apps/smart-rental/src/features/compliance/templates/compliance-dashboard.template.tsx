import { FileDown, Plus } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import type { ComplianceStatus } from "~/types/compliance";
import { SummaryCard } from "~/components/card/summary-card";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { complianceStatusConfig } from "~/constants/status";
import ComplianceTypeCard from "~/features/compliance/components/compliance-type-card";
import ResidenceChecklistCard from "~/features/compliance/components/residence-checklist-card";
import { useGetComplianceItems } from "~/hooks/api/compliance";

const summaryTiles: { status: ComplianceStatus; iconClassName: string }[] = [
  { status: "completed", iconClassName: "bg-emerald-100 text-emerald-600" },
  { status: "pending", iconClassName: "bg-blue-100 text-blue-600" },
  { status: "overdue", iconClassName: "bg-red-100 text-red-600" },
];

/**
 * "Tuân thủ" (Khai báo lưu trú): a count per status, the two kinds that get
 * a card of their own, then the full checklist. "Tạo file CT01" and "Thêm
 * yêu cầu" have no flow yet, as in the prototype.
 */
export default function ComplianceDashboardTemplate() {
  const { data, isLoading, isError, refetch } = useGetComplianceItems();
  const items = data ?? [];

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Tuân thủ"
        description="Quản lý khai báo nơi ở, kiểm tra an toàn và tài liệu."
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              <FileDown />
              Tạo file CT01 (VNeID)
            </Button>
            <Button type="button" size="sm">
              <Plus />
              Thêm yêu cầu
            </Button>
          </>
        }
      />

      {isLoading ? (
        <LoadingPanel itemCount={3} />
      ) : isError ? (
        <ErrorPanel
          description="Không thể tải dữ liệu tuân thủ."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : items.length === 0 ? (
        <EmptyPanel
          title="Chưa có yêu cầu tuân thủ"
          description="Thêm yêu cầu hoặc đồng bộ dữ liệu để theo dõi tại đây."
          className="border"
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {summaryTiles.map((tile) => (
              <SummaryCard
                key={tile.status}
                label={complianceStatusConfig[tile.status].label}
                value={
                  items.filter((item) => item.status === tile.status).length
                }
                icon={complianceStatusConfig[tile.status].icon}
                iconClassName={tile.iconClassName}
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ComplianceTypeCard
              type="residence_declaration"
              items={items}
              emptyText="Không có mục khai báo nơi ở."
            />
            <ComplianceTypeCard
              type="safety_inspection"
              items={items}
              emptyText="Không có mục kiểm tra an toàn."
            />
          </div>

          <ResidenceChecklistCard items={items} />
        </>
      )}
    </div>
  );
}
