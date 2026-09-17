import { Download, Edit, Gauge } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
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
import {
  estimateUtilityCost,
  utilityRate,
  utilityUnit,
} from "~/features/utilities/utils/meter-reading";
import { useGetUtility } from "~/hooks/api/utility";
import { formatCurrency } from "~/utils/currency";
import { formatDateTime, formatMonth } from "~/utils/date";

interface UtilityDetailTemplateProps {
  utilityId: string;
}

const TITLE = "Chi tiết chỉ số điện nước";

/**
 * One Chỉ số điện nước reading: the indices, a flat-rate billing preview, the
 * proof images and a two-step history. "Tải xuống" and "Chỉnh sửa" have no
 * flow yet, as in the prototype. The proof paths are Mock data the prototype
 * never shipped, so an image that fails to load shows its alt text.
 */
export default function UtilityDetailTemplate({
  utilityId,
}: UtilityDetailTemplateProps) {
  const { data: utility, isLoading } = useGetUtility(utilityId);

  const actions = (
    <>
      <Button type="button" variant="outline" size="sm">
        <Download />
        Tải xuống
      </Button>
      <Button type="button" size="sm">
        <Edit />
        Chỉnh sửa
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.UTILITIES}
        actions={actions}
      >
        <CardGridSkeleton itemCount={2} className="lg:grid-cols-2" />
      </DetailPageShell>
    );
  }

  if (!utility) {
    return (
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.UTILITIES}
        actions={actions}
      >
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
  const updatedAt = formatDateTime(utility.updatedAt);

  return (
    <DetailPageShell title={TITLE} backTo={ROUTES.UTILITIES} actions={actions}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {utility.roomName}
        </h2>
        <p className="text-muted-foreground text-sm">
          {formatMonth(utility.month)} • {type.label}
        </p>
      </div>

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
            value={utility.consumption.toLocaleString("vi-VN")}
            isHighlighted
          />
        </InfoCard>

        <InfoCard title="Chi tiết">
          <InfoRow label="Loại" value={<StatusBadge config={type} />} />
          <InfoRow
            label="Trạng thái"
            value={<StatusBadge config={utilityStatusConfig[utility.status]} />}
          />
          <InfoRow label="Cập nhật lần cuối" value={updatedAt} />
        </InfoCard>
      </div>

      <InfoCard title="Xem trước thanh toán">
        <InfoRow label="Tiêu thụ" value={`${utility.consumption} ${unit}`} />
        <InfoRow
          label="Giá"
          value={`${formatCurrency(utilityRate[utility.type])}/${unit}`}
        />
        <InfoRow
          label="Tổng cộng"
          value={formatCurrency(
            estimateUtilityCost(utility.type, utility.consumption),
          )}
          isHighlighted
        />
      </InfoCard>

      {utility.proofImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh chứng minh</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-4 md:grid-cols-2">
              {utility.proofImages.map((image, index) => (
                <li
                  key={image}
                  className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-lg border"
                >
                  <img
                    src={image}
                    alt={`Chứng từ ${index + 1}`}
                    className="size-full object-cover"
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-primary size-3 rounded-full" />
                <div className="bg-border h-12 w-0.5" />
              </div>
              <div>
                <p className="text-sm font-medium">Chỉ số được cập nhật</p>
                <p className="text-muted-foreground text-xs">{updatedAt}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="bg-muted-foreground size-3 rounded-full" />
              <div>
                <p className="text-sm font-medium">Chỉ số được tạo</p>
                <p className="text-muted-foreground text-xs">{updatedAt}</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </DetailPageShell>
  );
}
