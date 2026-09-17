import { useState } from "react";
import { DoorOpen, Edit, FileText, Gauge, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { toast } from "@monorepo/ui/components/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";

import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { DetailSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { roomStatusConfig, roomTypeConfig } from "~/constants/status";
import ContractCard from "~/features/contracts/components/contract-card";
import RoomFormSheet from "~/features/rooms/components/room-form-sheet";
import UtilityCard from "~/features/utilities/components/utility-card";
import { useGetBuilding } from "~/hooks/api/building";
import { useGetContracts } from "~/hooks/api/contract";
import { useDeleteRoom, useGetRoom } from "~/hooks/api/room";
import { useGetUtilities } from "~/hooks/api/utility";
import { formatCurrency } from "~/utils/currency";
import { canDeleteRoom } from "~/utils/room-delete";

interface RoomDetailTemplateProps {
  roomId: string;
}

const TITLE = "Chi tiết phòng";

/**
 * "Chi tiết phòng" (spec #153 §10 row 35): header entity + tabs Tổng quan ·
 * Hợp đồng · Chỉ số, cột phải chỉ liên kết. "Xóa" is disabled with a tooltip
 * reason while the Phòng has a live Hợp đồng (§10 row 37); a Phòng trống
 * deletes through the confirm dialog and lands back on the list.
 */
export default function RoomDetailTemplate({
  roomId,
}: RoomDetailTemplateProps) {
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const roomQuery = useGetRoom(roomId);
  const deleteRoom = useDeleteRoom();

  const room = roomQuery.data;
  const buildingQuery = useGetBuilding(room?.buildingId ?? "");
  const contractsQuery = useGetContracts({ buildingId: room?.buildingId });
  const utilitiesQuery = useGetUtilities({ buildingId: room?.buildingId });

  if (roomQuery.isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.ROOMS}>
        <DetailSkeleton />
      </DetailPageShell>
    );
  }

  if (!room) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.ROOMS}>
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
  const roomContracts = (contractsQuery.data ?? []).filter(
    (contract) => contract.roomId === room.id,
  );
  const roomUtilities = (utilitiesQuery.data ?? [])
    .filter((utility) => utility.roomId === room.id)
    .sort((a, b) => b.month.localeCompare(a.month));
  const canDelete = canDeleteRoom(room.id, contractsQuery.data ?? []);

  const handleDelete = () =>
    deleteRoom.mutate(room.id, {
      onSuccess: () => {
        toast.add({ title: `Đã xóa ${room.name}`, type: "success" });
        setIsDeleteOpen(false);
        navigate(ROUTES.ROOMS, { replace: true });
      },
    });

  const deleteButton = (
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

  const actions = (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsEditOpen(true)}
      >
        <Edit />
        Chỉnh sửa
      </Button>
      {canDelete ? (
        deleteButton
      ) : (
        // ponytail: hover-only reason — a disabled <button> drops out of the
        // tab order natively, and the wrapping span stays non-interactive
        // (Biome's noNoninteractiveTabindex) rather than faking a second
        // focus stop around it.
        <Tooltip>
          <TooltipTrigger render={<span>{deleteButton}</span>} />
          <TooltipContent>
            Phòng còn hợp đồng hiệu lực, không thể xoá.
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );

  return (
    <>
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.ROOMS}
        name={room.name}
        badge={<StatusBadge config={status} />}
        meta={[
          buildingQuery.data?.name,
          `Tầng ${room.floor}`,
          `${formatCurrency(room.price)}/tháng`,
        ].filter((item): item is string => !!item)}
        actions={actions}
        tabs={[
          {
            value: "overview",
            label: "Tổng quan",
            content: (
              <>
                <InfoCard title="Thông tin phòng">
                  <InfoRow label="Mã phòng" value={room.id} />
                  <InfoRow label="Loại phòng" value={typeLabel} />
                  <InfoRow label="Diện tích" value={`${room.area}m²`} />
                  <InfoRow label="Cập nhật lần cuối" value={room.lastUpdated} />
                </InfoCard>

                <InfoCard title="Người thuê hiện tại">
                  {room.tenant ? (
                    <InfoRow
                      label="Tên Người thuê"
                      value={room.tenant}
                      isHighlighted
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      Phòng này hiện chưa có Người thuê
                    </p>
                  )}
                </InfoCard>
              </>
            ),
          },
          {
            value: "contracts",
            label: "Hợp đồng",
            content:
              roomContracts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {roomContracts.map((contract) => (
                    <ContractCard key={contract.id} contract={contract} />
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={FileText}
                  title="Chưa có hợp đồng."
                  description="Phòng này chưa từng gắn với hợp đồng nào."
                  className="border"
                />
              ),
          },
          {
            value: "utilities",
            label: "Chỉ số",
            content:
              roomUtilities.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {roomUtilities.map((utility) => (
                    <UtilityCard key={utility.id} utility={utility} />
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={Gauge}
                  title="Chưa có chỉ số."
                  description="Phòng này chưa có bản ghi chỉ số điện nước nào."
                  className="border"
                />
              ),
          },
        ]}
        sidebar={
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liên kết</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to={ROUTES.buildingDetailPath(room.buildingId)}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full",
                })}
              >
                Xem toà nhà
              </Link>
            </CardContent>
          </Card>
        }
      />

      <RoomFormSheet
        room={room}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

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
    </>
  );
}
