import { Card, CardContent } from "@monorepo/ui/components/card";
import { toast } from "@monorepo/ui/components/toast";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { ResidenceDeclarationLines } from "~/components/card/residence-declaration-lines";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import {
  useGetResidenceDeclarations,
  useMarkResidenceNotificationSent,
} from "~/hooks/api/compliance";
import { useBuildingStore } from "~/stores/use-building-store";

/**
 * "Khai báo lưu trú" (spec #153 §10 row 8, ticket #161): mỗi Người thuê có
 * Hợp đồng hiệu lực là một thẻ, hai dòng nghĩa vụ. Không còn màn theo LOẠI
 * khai báo — mỗi Người thuê chỉ có đúng một Thông báo lưu trú và một Đăng ký
 * tạm trú, nên gom theo Người thuê đọc tự nhiên hơn gom theo loại.
 */
export default function ComplianceDashboardTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetResidenceDeclarations({
    buildingId: selectedBuildingId,
  });
  const markSent = useMarkResidenceNotificationSent();
  const declarations = data ?? [];

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Khai báo lưu trú"
        description="Thông báo lưu trú và Đăng ký tạm trú của Người thuê đang có Hợp đồng hiệu lực."
      />

      {isLoading ? (
        <div className="space-y-6">
          <KpiStripSkeleton count={2} />
          <CardGridSkeleton itemCount={4} />
        </div>
      ) : isError ? (
        <ErrorPanel
          description="Không thể tải dữ liệu khai báo lưu trú."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : declarations.length === 0 ? (
        <EmptyPanel
          title="Không có Người thuê nào đang có Hợp đồng hiệu lực"
          description="Khai báo lưu trú chỉ áp dụng cho Người thuê có Hợp đồng đang hiệu lực."
          className="border"
        />
      ) : (
        <>
          <KpiStrip
            items={[
              {
                label: "Chưa gửi Thông báo",
                value: declarations.filter(
                  (item) => item.notificationStatus === "not_sent",
                ).length,
              },
              {
                label: "Sắp hết hạn Đăng ký",
                value: declarations.filter(
                  (item) => item.registrationExpiringSoon,
                ).length,
              },
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {declarations.map((declaration) => (
              <Card key={declaration.tenantId}>
                <CardContent>
                  <ResidenceDeclarationLines
                    declaration={declaration}
                    isMarking={markSent.isPending}
                    onMarkSent={() =>
                      markSent.mutate(
                        { tenantId: declaration.tenantId },
                        {
                          onSuccess: () =>
                            toast.add({
                              title: `Đã đánh dấu gửi Thông báo lưu trú cho ${declaration.tenantName}`,
                              type: "success",
                            }),
                        },
                      )
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
