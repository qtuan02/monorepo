import { Building2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Separator } from "@monorepo/ui/components/separator";

import { InfoCard, InfoRow } from "~/components/card/info-card";
import { StatItem } from "~/components/card/stat-item";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import OccupancyBar from "~/features/buildings/components/occupancy-bar";
import { getBuildingStats } from "~/features/buildings/utils/building-stats";
import { useGetBuilding } from "~/hooks/api/building";

interface BuildingDetailTemplateProps {
  buildingId: string;
}

const TITLE = "Chi tiết tòa nhà";

export default function BuildingDetailTemplate({
  buildingId,
}: BuildingDetailTemplateProps) {
  const buildingQuery = useGetBuilding(buildingId);

  if (buildingQuery.isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.BUILDINGS}>
        <LoadingPanel itemCount={3} />
      </DetailPageShell>
    );
  }

  const building = buildingQuery.data;
  if (!building) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.BUILDINGS}>
        <EmptyPanel
          icon={Building2}
          title="Không tìm thấy tòa nhà."
          description={`Không có tòa nhà nào với mã ${buildingId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const stats = getBuildingStats(building);

  return (
    <DetailPageShell title={TITLE} backTo={ROUTES.BUILDINGS}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{building.name}</CardTitle>
              <CardDescription>{building.address}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent>
              <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                <StatItem label="Tổng phòng" value={stats.totalRooms} />
                <StatItem
                  label="Phòng trống"
                  value={stats.availableRooms}
                  valueClassName="text-emerald-700"
                />
                <StatItem
                  label="Đang hoạt động"
                  value={stats.activeContracts}
                />
              </dl>
            </CardContent>
          </Card>

          <InfoCard title="Thông tin tòa nhà">
            <InfoRow label="Mã tòa nhà" value={building.id} />
            <InfoRow label="Tên tòa nhà" value={building.name} />
            <InfoRow label="Địa chỉ" value={building.address} />
            <InfoRow label="Mô tả" value={building.description ?? "---"} />
          </InfoCard>
        </div>

        <Card className="self-start">
          <CardHeader>
            <CardTitle className="text-base">Tỷ lệ Lấp đầy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{stats.occupancyRate}%</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Tỷ lệ chiếm dụng
              </p>
            </div>
            <OccupancyBar rate={stats.occupancyRate} />
          </CardContent>
        </Card>
      </div>
    </DetailPageShell>
  );
}
