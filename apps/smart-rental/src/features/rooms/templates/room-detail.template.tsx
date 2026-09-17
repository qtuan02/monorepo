import { useState } from "react";
import { DoorOpen, Download, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Separator } from "@monorepo/ui/components/separator";
import { toast } from "@monorepo/ui/components/toast";

import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { StatItem } from "~/components/card/stat-item";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { roomStatusConfig, roomTypeConfig } from "~/constants/status";
import { useDeleteRoom, useGetRoom } from "~/hooks/api/room";
import { formatCurrency } from "~/utils/currency";

interface RoomDetailTemplateProps {
  roomId: string;
}

const TITLE = "Chi tiết phòng";

/** What the status card says under the badge, per status. */
const statusNote = {
  available: "Sẵn sàng cho Người thuê mới",
  maintenance: "Đang trong quá trình bảo trì",
  reserved: "Đã được đặt trước",
} as const;

/**
 * "Chi tiết phòng". "In phòng" and "Chỉnh sửa" have no flow yet, as in the
 * prototype; "Xóa" goes through the confirm dialog and really removes the
 * Phòng from the Mock, then lands back on the list.
 */
export default function RoomDetailTemplate({
  roomId,
}: RoomDetailTemplateProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: room, isLoading } = useGetRoom(roomId);
  const deleteRoom = useDeleteRoom();

  const actions = (
    <>
      <Button type="button" variant="outline" size="sm">
        <Download />
        In phòng
      </Button>
      <Button type="button" variant="outline" size="sm">
        <Edit />
        Chỉnh sửa
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        disabled={!room}
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 />
        Xóa
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.ROOMS} actions={actions}>
        <LoadingPanel itemCount={3} />
      </DetailPageShell>
    );
  }

  if (!room) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.ROOMS} actions={actions}>
        <EmptyPanel
          icon={DoorOpen}
          title="Không tìm thấy phòng."
          description={`Không có phòng nào với mã ${roomId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const status = roomStatusConfig[room.status];
  const typeLabel = roomTypeConfig[room.type].label;

  const handleDelete = () =>
    deleteRoom.mutate(room.id, {
      onSuccess: () => {
        toast.add({ title: `Đã xóa ${room.name}`, type: "success" });
        setIsDeleteOpen(false);
        navigate(ROUTES.ROOMS, { replace: true });
      },
    });

  return (
    <DetailPageShell title={TITLE} backTo={ROUTES.ROOMS} actions={actions}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{room.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Tầng {room.floor}
                  </CardDescription>
                </div>
                <StatusBadge config={status} />
              </div>
            </CardHeader>
            <Separator />
            <CardContent>
              <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                <StatItem label="Loại phòng" value={typeLabel} />
                <StatItem label="Diện tích" value={`${room.area}m²`} />
                <StatItem
                  label="Giá thuê/tháng"
                  value={formatCurrency(room.price)}
                />
              </dl>
            </CardContent>
          </Card>

          <InfoCard title="Thông tin cơ bản">
            <InfoRow label="ID phòng" value={room.id} />
            <InfoRow label="Tầng" value={`Tầng ${room.floor}`} />
            <InfoRow label="Loại phòng" value={typeLabel} />
            <InfoRow label="Diện tích" value={`${room.area}m²`} />
            <InfoRow
              label="Giá thuê/tháng"
              value={formatCurrency(room.price)}
              isHighlighted
            />
            <InfoRow label="Cập nhật lần cuối" value={room.lastUpdated} />
          </InfoCard>

          <InfoCard title="Thông tin Người thuê">
            {room.tenant ? (
              <>
                <InfoRow
                  label="Tên Người thuê"
                  value={room.tenant}
                  isHighlighted
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                >
                  Xem hồ sơ Người thuê
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Phòng này hiện chưa có Người thuê
              </p>
            )}
          </InfoCard>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trạng thái hiện tại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <StatusBadge
                  config={status}
                  className="w-full justify-center"
                />
              </div>
              <div className="space-y-2 text-sm">
                {room.status === "occupied" ? (
                  <>
                    <p className="font-medium">Người thuê hiện tại</p>
                    <p className="text-muted-foreground">{room.tenant}</p>
                  </>
                ) : (
                  <p className="font-medium">{statusNote[room.status]}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi tiết thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Giá thuê hàng tháng
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(room.price)}
                </p>
              </div>
              <Separator />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                Xem lịch sử thanh toán
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nhanh chóng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                Tạo hoá đơn
              </Button>
              {room.tenant && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Xem hợp đồng
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa phòng"
        description={`Bạn có chắc chắn muốn xóa phòng "${room.name}" không? Hành động này không thể hoàn tác.`}
        actionLabel="Xóa"
        variant="destructive"
        isPending={deleteRoom.isPending}
        onConfirm={handleDelete}
      />
    </DetailPageShell>
  );
}
