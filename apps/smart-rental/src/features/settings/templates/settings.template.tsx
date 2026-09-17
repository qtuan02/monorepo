import { useState } from "react";
import { Building2, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { Card, CardContent } from "@monorepo/ui/components/card";
import { toast } from "@monorepo/ui/components/toast";

import { InfoCard, InfoRow } from "~/components/card/info-card";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { QuerySection } from "~/components/panel/query-section";
import { ROUTES } from "~/constants/routes";
import { useGetBuildings } from "~/hooks/api/building";
import { useGetLandlordProfile, useResetMockData } from "~/hooks/api/setting";

/**
 * "Cài đặt" toàn cục (spec #153 §10 row 32): hồ sơ chủ nhà, một nút khôi
 * phục Mock, và một link tới Cài đặt của từng Toà nhà — the bậc thang form
 * and the "Tuân thủ & liên lạc" quick-link card are both gone; the first
 * because Bảng giá is now flat per Toà nhà, the second because a card of
 * dead links is not a setting (research C.1 #23).
 */
export default function SettingsTemplate() {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const profileQuery = useGetLandlordProfile();
  const buildingsQuery = useGetBuildings();
  const resetMockData = useResetMockData();

  const handleReset = () =>
    resetMockData.mutate(undefined, {
      onSuccess: () => {
        setIsResetOpen(false);
        toast.add({ title: "Đã khôi phục dữ liệu mẫu", type: "success" });
      },
    });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Cài đặt"
        description="Hồ sơ chủ nhà và các Toà nhà đang quản lý."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsResetOpen(true)}
          >
            <RotateCcw />
            Khôi phục dữ liệu mẫu
          </Button>
        }
      />

      <QuerySection
        query={profileQuery}
        errorText="Không thể tải hồ sơ chủ nhà."
        loading={<CardGridSkeleton className="lg:grid-cols-1" itemCount={1} />}
      >
        {(profile) => (
          <InfoCard title="Hồ sơ chủ nhà">
            <InfoRow label="Họ tên" value={profile.name} />
            <InfoRow label="Số điện thoại" value={profile.phone} />
            <InfoRow label="Email" value={profile.email} />
          </InfoCard>
        )}
      </QuerySection>

      <QuerySection
        query={buildingsQuery}
        errorText="Không thể tải danh sách Toà nhà."
        loading={<CardGridSkeleton itemCount={3} />}
      >
        {(buildings) =>
          buildings.length > 0 ? (
            <Card>
              <CardContent className="flex flex-wrap gap-2">
                {buildings.map((building) => (
                  <Link
                    key={building.id}
                    to={ROUTES.buildingDetailPath(building.id)}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    <SettingsIcon />
                    Cài đặt {building.name}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : (
            <EmptyPanel
              icon={Building2}
              title="Chưa có Toà nhà."
              description="Thêm một Toà nhà để cấu hình Bảng giá và Tài khoản nhận tiền."
              className="border"
            />
          )
        }
      </QuerySection>

      <ConfirmActionDialog
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        title="Khôi phục dữ liệu mẫu"
        description="Toàn bộ Toà nhà, Phòng, Người thuê, Hợp đồng, Hoá đơn, Chỉ số, Chi phí và Khai báo lưu trú sẽ trở về dữ liệu mẫu ban đầu. Mọi thay đổi trong phiên này sẽ mất."
        actionLabel="Khôi phục"
        variant="destructive"
        isPending={resetMockData.isPending}
        onConfirm={handleReset}
      />
    </div>
  );
}
