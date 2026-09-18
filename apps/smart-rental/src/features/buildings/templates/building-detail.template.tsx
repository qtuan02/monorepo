import { useState } from "react";
import { AlertTriangle, Building2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@monorepo/ui/components/alert";
import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { toast } from "@monorepo/ui/components/toast";

import { InfoCard, InfoRow } from "~/components/card/info-card";
import { StatGroup, StatItem } from "~/components/card/stat-item";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { DetailSkeleton } from "~/components/panel/loading-panel";
import { OccupancyBar } from "~/components/progress/occupancy-bar";
import { ROUTES } from "~/constants/routes";
import { ELECTRICITY_PRICE_CAP_PER_KWH } from "~/constants/tariff";
import BuildingSettingsFormSheet from "~/features/buildings/components/building-settings-form-sheet";
import { getBuildingStats } from "~/features/buildings/utils/building-stats";
import RoomGrid from "~/features/rooms/components/room-grid";
import { useDeleteBuilding, useGetBuilding } from "~/hooks/api/building";
import { useGetContracts } from "~/hooks/api/contract";
import { useGetRooms } from "~/hooks/api/room";
import { canDeleteBuilding } from "~/utils/building-delete";
import { formatCurrency } from "~/utils/currency";
import { isElectricityPriceOverCap } from "~/utils/tariff";

interface BuildingDetailTemplateProps {
  buildingId: string;
}

const TITLE = "Chi tiết toà nhà";

/**
 * "Chi tiết toà nhà" (spec #153 §3.4): header entity + tabs Tổng quan · Phòng
 * · Cài đặt, cột phải chỉ tỷ lệ lấp đầy. The reference the other nine detail
 * screens migrate to next, one ticket at a time (#160–#166).
 */
export default function BuildingDetailTemplate({
  buildingId,
}: BuildingDetailTemplateProps) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const buildingQuery = useGetBuilding(buildingId);
  const roomsQuery = useGetRooms({ buildingId });
  const contractsQuery = useGetContracts({ buildingId });
  const deleteBuilding = useDeleteBuilding();

  if (buildingQuery.isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.BUILDINGS}>
        <DetailSkeleton />
      </DetailPageShell>
    );
  }

  const building = buildingQuery.data;
  if (!building) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.BUILDINGS}>
        <EmptyPanel
          icon={Building2}
          title="Không tìm thấy toà nhà."
          description={`Không có toà nhà nào với mã ${buildingId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const stats = getBuildingStats(building);
  const rooms = roomsQuery.data ?? [];
  const canDelete = canDeleteBuilding(building.id, contractsQuery.data ?? []);
  const isElectricityOverCap = isElectricityPriceOverCap(
    building.priceList.electricityPricePerKwh,
  );

  const handleDelete = () =>
    deleteBuilding.mutate(building.id, {
      onSuccess: () => {
        toast.add({ title: `Đã xóa ${building.name}`, type: "success" });
        setIsDeleteOpen(false);
        navigate(ROUTES.BUILDINGS, { replace: true });
      },
    });

  // "Cài đặt" has exactly one entry point — the tab's own "Chỉnh sửa" — not a
  // second header button opening the same sheet (spec #179 §"Chi tiết / danh
  // sách").
  const actions = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={!canDelete}
      onClick={() => setIsDeleteOpen(true)}
    >
      <Trash2 />
      Xóa
    </Button>
  );

  return (
    <>
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.BUILDINGS}
        name={building.name}
        meta={[
          building.address,
          building.totalFloors ? `${building.totalFloors} tầng` : undefined,
          `Ngày thu ${building.collectionDay} hằng tháng`,
        ].filter((item): item is string => !!item)}
        actions={actions}
        tabs={[
          {
            value: "overview",
            label: "Tổng quan",
            content: (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Số liệu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatGroup>
                      <StatItem label="Tổng phòng" value={stats.totalRooms} />
                      <StatItem
                        label="Phòng trống"
                        value={stats.availableRooms}
                        valueClassName="text-success"
                      />
                      <StatItem
                        label="Đang hoạt động"
                        value={stats.activeContracts}
                      />
                    </StatGroup>
                  </CardContent>
                </Card>

                <InfoCard title="Thông tin toà nhà">
                  <InfoRow label="Mã toà nhà" value={building.id} />
                  <InfoRow
                    label="Mô tả"
                    value={building.description ?? "---"}
                  />
                </InfoCard>
              </>
            ),
          },
          {
            value: "rooms",
            label: "Phòng",
            content:
              rooms.length > 0 ? (
                <RoomGrid rooms={rooms} />
              ) : (
                <EmptyPanel
                  icon={Building2}
                  title="Chưa có phòng."
                  description="Toà nhà này chưa có phòng nào."
                  className="border"
                />
              ),
          },
          {
            value: "settings",
            label: "Cài đặt",
            content: (
              <InfoCard title="Bảng giá & Tài khoản nhận tiền">
                <InfoRow
                  label="Ngày thu trong tháng"
                  value={`Ngày ${building.collectionDay}`}
                />
                <InfoRow
                  label="Giá điện"
                  value={`${formatCurrency(building.priceList.electricityPricePerKwh)}/kWh`}
                  isHighlighted={isElectricityOverCap}
                />
                {isElectricityOverCap && (
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>Vượt trần giá điện cho người thuê</AlertTitle>
                    <AlertDescription>
                      Trần theo quy định hiện hành là{" "}
                      {formatCurrency(ELECTRICITY_PRICE_CAP_PER_KWH)}/kWh.
                    </AlertDescription>
                  </Alert>
                )}
                <InfoRow
                  label="Giá nước"
                  value={`${formatCurrency(building.priceList.waterPricePerM3)}/m³`}
                />
                <InfoRow
                  label="Dịch vụ cố định"
                  value={formatCurrency(building.priceList.serviceFee)}
                />
                {building.bankAccount ? (
                  <>
                    <InfoRow
                      label="Ngân hàng"
                      value={building.bankAccount.bankName}
                    />
                    <InfoRow
                      label="Số tài khoản"
                      value={building.bankAccount.accountNumber}
                    />
                    <InfoRow
                      label="Tên chủ tài khoản"
                      value={building.bankAccount.accountName}
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    Chưa khai Tài khoản nhận tiền — Hoá đơn của toà nhà này chưa
                    có mã VietQR.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  Chỉnh sửa
                </Button>
              </InfoCard>
            ),
          },
        ]}
        sidebar={
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tỷ lệ lấp đầy</CardTitle>
            </CardHeader>
            {/* One "83%" — the OccupancyBar's own figure, not a second big
                number above it (spec #179 §"Chi tiết / danh sách"). */}
            <CardContent>
              <OccupancyBar rate={stats.occupancyRate} />
            </CardContent>
          </Card>
        }
      />

      <BuildingSettingsFormSheet
        building={building}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />

      <ConfirmActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa toà nhà"
        description={`Bạn có chắc chắn muốn xóa toà nhà "${building.name}" không? Hành động này không thể hoàn tác.`}
        actionLabel="Xóa"
        variant="destructive"
        isPending={deleteBuilding.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
