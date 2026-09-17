import { useState } from "react";
import {
  Calendar,
  CreditCard,
  DoorOpen,
  Download,
  Edit,
  FileText,
  Mail,
  Phone,
  Trash2,
  UserX,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Separator } from "@monorepo/ui/components/separator";
import { toast } from "@monorepo/ui/components/toast";
import { cn } from "@monorepo/ui/utils/cn";

import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { StatItem } from "~/components/card/stat-item";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { tenantStatusConfig } from "~/constants/status";
import TenantAvatar from "~/features/tenants/components/tenant-avatar";
import { useDeleteTenant, useGetTenant } from "~/hooks/api/tenant";
import { formatCurrency } from "~/utils/currency";

interface TenantDetailTemplateProps {
  tenantId: string;
}

const TITLE = "Chi tiết Người thuê";

const genderLabel = { male: "Nam", female: "Nữ" } as const;

/**
 * "Chi tiết Người thuê". "In hồ sơ", "Chỉnh sửa" and the quick actions have
 * no flow yet, as in the prototype; "Xóa" confirms, then removes the entry
 * from the Mock.
 */
export default function TenantDetailTemplate({
  tenantId,
}: TenantDetailTemplateProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: tenant, isLoading } = useGetTenant(tenantId);
  const deleteTenant = useDeleteTenant();

  const actions = (
    <>
      <Button type="button" variant="outline" size="sm">
        <Download />
        In hồ sơ
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
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 />
        Xóa
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.TENANTS} actions={actions}>
        <CardGridSkeleton itemCount={3} />
      </DetailPageShell>
    );
  }

  if (!tenant) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.TENANTS} actions={actions}>
        <EmptyPanel
          icon={UserX}
          title="Không tìm thấy Người thuê"
          description={`Không có Người thuê nào với mã ${tenantId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const status = tenantStatusConfig[tenant.status];

  const handleDelete = () =>
    deleteTenant.mutate(tenant.id, {
      onSuccess: () => {
        toast.add({
          title: `Đã xóa Người thuê ${tenant.name}`,
          type: "success",
        });
        setIsDeleteOpen(false);
        navigate(ROUTES.TENANTS, { replace: true });
      },
    });

  return (
    <DetailPageShell title={TITLE} backTo={ROUTES.TENANTS} actions={actions}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <TenantAvatar
                    tenant={tenant}
                    className="size-16 text-xl shadow-md"
                  />
                  <div>
                    <CardTitle className="text-2xl">{tenant.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {genderLabel[tenant.gender]}
                    </CardDescription>
                  </div>
                </div>
                <StatusBadge config={status} />
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-3">
                <DoorOpen className="text-muted-foreground size-4" />
                {tenant.room} • Tầng {tenant.floor}
              </p>
              <p className="flex items-center gap-3">
                <Phone className="text-muted-foreground size-4" />
                {tenant.phone}
              </p>
              <p className="flex items-center gap-3">
                <Mail className="text-muted-foreground size-4" />
                <span className="truncate">{tenant.email}</span>
              </p>
            </CardContent>
          </Card>

          <InfoCard title="Thông tin cá nhân">
            <InfoRow label="ID Người thuê" value={tenant.id} />
            <InfoRow label="Tên" value={tenant.name} />
            <InfoRow label="Số CCCD/CMND" value={tenant.idNumber} />
            <InfoRow label="Giới tính" value={genderLabel[tenant.gender]} />
            <InfoRow label="Điện thoại" value={tenant.phone} />
            <InfoRow label="Email" value={tenant.email} />
          </InfoCard>

          <InfoCard title="Thông tin phòng và hợp đồng">
            <InfoRow label="Phòng" value={tenant.room} isHighlighted />
            <InfoRow label="Tầng" value={`Tầng ${tenant.floor}`} />
            <InfoRow label="Ngày vào" value={tenant.moveInDate} />
            <InfoRow label="Ngày kết thúc HĐ" value={tenant.contractEnd} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
            >
              <FileText />
              Xem hợp đồng
            </Button>
          </InfoCard>

          <InfoCard title="Thông tin thanh toán">
            <dl className="grid grid-cols-2 gap-4">
              <StatItem
                label="Tiền thuê/tháng"
                value={formatCurrency(tenant.rentAmount)}
                valueClassName="text-lg font-bold tabular-nums"
              />
              <StatItem
                label="Tiền cọc"
                value={formatCurrency(tenant.depositAmount)}
                valueClassName="text-lg font-bold tabular-nums"
              />
            </dl>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
            >
              Lịch sử thanh toán
            </Button>
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
                <p className="font-medium">Khoá phòng</p>
                <p className="text-muted-foreground">{tenant.room}</p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Loại hợp đồng</p>
                <p className="text-muted-foreground">Hợp đồng dài hạn</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                <CreditCard />
                Tạo hoá đơn
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                <FileText />
                Xem hợp đồng
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Calendar />
                Lịch sử
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href={`tel:${tenant.phone}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full",
                )}
              >
                <Phone />
                Gọi điện
              </a>
              <a
                href={`mailto:${tenant.email}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full",
                )}
              >
                <Mail />
                Gửi email
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa Người thuê"
        description={`Bạn có chắc chắn muốn xóa Người thuê "${tenant.name}" không? Hành động này không thể hoàn tác.`}
        actionLabel="Xóa"
        variant="destructive"
        isPending={deleteTenant.isPending}
        onConfirm={handleDelete}
      />
    </DetailPageShell>
  );
}
