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
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
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

      {profileQuery.isLoading ? (
        <CardGridSkeleton className="lg:grid-cols-1" itemCount={1} />
      ) : profileQuery.isError || !profileQuery.data ? (
        <ErrorPanel
          description="Không thể tải hồ sơ chủ nhà."
          action={{
            label: "Thử lại",
            onClick: () => void profileQuery.refetch(),
          }}
        />
      ) : (
        <InfoCard title="Hồ sơ chủ nhà">
          <InfoRow label="Họ tên" value={profileQuery.data.name} />
          <InfoRow label="Số điện thoại" value={profileQuery.data.phone} />
          <InfoRow label="Email" value={profileQuery.data.email} />
        </InfoCard>
      )}

      {buildingsQuery.isLoading ? (
        <CardGridSkeleton itemCount={3} />
      ) : buildingsQuery.isError || !buildingsQuery.data ? (
        <ErrorPanel
          description="Không thể tải danh sách Toà nhà."
          action={{
            label: "Thử lại",
            onClick: () => void buildingsQuery.refetch(),
          }}
        />
      ) : buildingsQuery.data.length > 0 ? (
        <Card>
          <CardContent className="flex flex-wrap gap-2">
            {buildingsQuery.data.map((building) => (
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
      )}

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
