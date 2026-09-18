import { Gauge } from "lucide-react";

import { AttachmentGroup } from "@monorepo/ui/components/attachment";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { utilityStatusConfig, utilityTypeConfig } from "~/constants/status";
import ProofImageAttachment from "~/features/utilities/components/proof-image-attachment";
import {
  estimateUtilityCost,
  utilityUnit,
} from "~/features/utilities/utils/meter-reading";
import { useGetBuilding } from "~/hooks/api/building";
import { useGetUtilities, useGetUtility } from "~/hooks/api/utility";
import { formatCurrency } from "~/utils/currency";
import { formatDateTime, formatMonth } from "~/utils/date";

interface UtilityDetailTemplateProps {
  utilityId: string;
}

const TITLE = "Chi tiết chỉ số điện nước";

/**
 * One Chỉ số điện nước reading: the indices, a billing preview off the Toà
 * nhà's own Bảng giá (spec #153 §10 row 6 — never the flat 3.500/8.000 the
 * prototype hard-coded), the proof images (a broken one falls back rather
 * than showing a broken-image glyph) and two REAL history points — this
 * reading and the one before it for the same Phòng + loại, not a fake
 * "created/updated" pair off one timestamp.
 */
export default function UtilityDetailTemplate({
  utilityId,
}: UtilityDetailTemplateProps) {
  const { data: utility, isLoading } = useGetUtility(utilityId);
  const { data: building } = useGetBuilding(utility?.buildingId ?? "", {
    enabled: !!utility?.buildingId,
  });
  const { data: roomUtilities = [] } = useGetUtilities(
    { buildingId: utility?.buildingId, roomId: utility?.roomId },
    { enabled: !!utility },
  );

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.UTILITIES}>
        <CardGridSkeleton itemCount={2} className="lg:grid-cols-2" />
      </DetailPageShell>
    );
  }

  if (!utility) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.UTILITIES}>
        <EmptyPanel
          icon={Gauge}
          title="Chỉ số không tìm thấy."
          description={`Không có bản ghi nào với mã ${utilityId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const type = utilityTypeConfig[utility.type];
  const unit = utilityUnit[utility.type];
  const rate = building
    ? utility.type === "electricity"
      ? building.priceList.electricityPricePerKwh
      : building.priceList.waterPricePerM3
    : undefined;
  const cost = building
    ? estimateUtilityCost(utility.type, utility.consumption, building.priceList)
    : undefined;

  const sameTypeHistory = roomUtilities
    .filter((reading) => reading.type === utility.type)
    .sort((a, b) => a.month.localeCompare(b.month));
  const currentIndex = sameTypeHistory.findIndex(
    (reading) => reading.id === utility.id,
  );
  const previous =
    currentIndex > 0 ? sameTypeHistory[currentIndex - 1] : undefined;
  const historyPoints = [previous, utility].filter((reading) => !!reading);

  return (
    <DetailPageShell
      title={TITLE}
      backTo={ROUTES.UTILITIES}
      name={utility.roomName}
      badge={<StatusBadge config={utilityStatusConfig[utility.status]} />}
      meta={[type.label, formatMonth(utility.month), building?.name].filter(
        (item): item is string => !!item,
      )}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard title="Tóm tắt chỉ số">
          <InfoRow
            label="Chỉ số cũ"
            value={utility.oldIndex.toLocaleString("vi-VN")}
          />
          <InfoRow
            label="Chỉ số mới"
            value={utility.newIndex.toLocaleString("vi-VN")}
          />
          <InfoRow
            label="Tiêu thụ"
            value={`${utility.consumption.toLocaleString("vi-VN")} ${unit}`}
            isHighlighted
          />
        </InfoCard>

        <InfoCard title="Chi tiết">
          <InfoRow label="Loại" value={<StatusBadge config={type} />} />
          <InfoRow
            label="Cập nhật lần cuối"
            value={formatDateTime(utility.updatedAt)}
          />
        </InfoCard>
      </div>

      <InfoCard title="Xem trước thanh toán">
        <InfoRow label="Tiêu thụ" value={`${utility.consumption} ${unit}`} />
        <InfoRow
          label="Đơn giá"
          value={rate !== undefined ? `${formatCurrency(rate)}/${unit}` : "—"}
        />
        <InfoRow
          label="Tổng cộng"
          value={cost !== undefined ? formatCurrency(cost) : "—"}
          isHighlighted
        />
      </InfoCard>

      {utility.proofImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh chứng minh</CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentGroup>
              {utility.proofImages.map((image, index) => (
                <ProofImageAttachment key={image} src={image} index={index} />
              ))}
            </AttachmentGroup>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử</CardTitle>
        </CardHeader>
        <CardContent>
          {historyPoints.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Chưa có mốc lịch sử nào khác cho Phòng này.
            </p>
          ) : (
            <ol className="space-y-4">
              {historyPoints.map((point, index) => (
                <li key={point.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={
                        index === historyPoints.length - 1
                          ? "bg-primary size-3 rounded-full"
                          : "bg-muted-foreground size-3 rounded-full"
                      }
                    />
                    {index < historyPoints.length - 1 && (
                      <div className="bg-border h-12 w-0.5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Kỳ {formatMonth(point.month)} —{" "}
                      {point.oldIndex.toLocaleString("vi-VN")}
                      {" → "}
                      {point.newIndex.toLocaleString("vi-VN")} {unit}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDateTime(point.updatedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </DetailPageShell>
  );
}
