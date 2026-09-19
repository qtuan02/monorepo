import { useState } from "react";
import { Edit, Mail, Phone, ScrollText, UserX } from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

import { StatusBadge } from "~/components/badge/status-badge";
import { EntityListCard } from "~/components/card/entity-list-card";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { ResidenceDeclarationLines } from "~/components/card/residence-declaration-lines";
import { StatGroup, StatItem } from "~/components/card/stat-item";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { RelationTab } from "~/components/page/relation-tab";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { ROUTES } from "~/constants/routes";
import {
  contractStatusConfig,
  invoiceStatusConfig,
  tenantOverdueInvoiceConfig,
  tenantStatusConfig,
} from "~/constants/status";
import TenantFormSheet from "~/features/tenants/components/tenant-form-sheet";
import { useGetBuilding } from "~/hooks/api/building";
import { useGetResidenceDeclarations } from "~/hooks/api/compliance";
import { useGetContracts } from "~/hooks/api/contract";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useGetTenant } from "~/hooks/api/tenant";
import { formatCurrency } from "~/utils/currency";

interface TenantDetailTemplateProps {
  tenantId: string;
}

const TITLE = "Chi tiết Người thuê";
const genderLabel = { male: "Nam", female: "Nữ" } as const;

/**
 * "Chi tiết Người thuê" (spec #153 §3.4, §10 row 10, ticket #161): một bố
 * cục — header (tên · badge · Phòng · Toà nhà · điện thoại), tabs Tổng quan
 * · Hợp đồng · Hoá đơn · Lưu trú. Không "Hành động nhanh", không "Khoá
 * phòng" — cả hai bị bỏ theo quyết định #14/#37 của grill.
 */
export default function TenantDetailTemplate({
  tenantId,
}: TenantDetailTemplateProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const tenantQuery = useGetTenant(tenantId);
  const tenant = tenantQuery.data;
  const buildingQuery = useGetBuilding(tenant?.buildingId ?? "", {
    enabled: !!tenant?.buildingId,
  });
  const contractsQuery = useGetContracts();
  const invoicesQuery = useGetInvoices();
  const declarationsQuery = useGetResidenceDeclarations();

  if (!tenant) {
    return (
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.TENANTS}
        query={tenantQuery}
        id={tenantId}
        notFound={(id) => ({
          icon: UserX,
          title: "Không tìm thấy Người thuê",
          description: `Không có Người thuê nào với mã ${id}.`,
        })}
      />
    );
  }

  const tenantContracts = (contractsQuery.data ?? []).filter(
    (contract) => contract.tenantId === tenant.id,
  );
  const contractIds = new Set(tenantContracts.map((contract) => contract.id));
  const tenantInvoices = (invoicesQuery.data ?? []).filter((invoice) =>
    contractIds.has(invoice.contractId),
  );
  const declaration = declarationsQuery.data?.find(
    (item) => item.tenantId === tenant.id,
  );
  const status = tenantStatusConfig[tenant.status];

  return (
    <>
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.TENANTS}
        name={tenant.name}
        badge={
          <div className="flex items-center gap-1.5">
            <StatusBadge config={status} />
            {tenant.hasOverdueInvoice && (
              <StatusBadge config={tenantOverdueInvoiceConfig} isCompact />
            )}
          </div>
        }
        meta={[tenant.room, buildingQuery.data?.name, tenant.phone].filter(
          (item): item is string => !!item,
        )}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(true)}
          >
            <Edit />
            Chỉnh sửa
          </Button>
        }
        tabs={[
          {
            value: "overview",
            label: "Tổng quan",
            content: (
              <>
                <InfoCard title="Thông tin cá nhân">
                  <InfoRow label="Mã Người thuê" value={tenant.id} />
                  <InfoRow label="Số CCCD/CMND" value={tenant.idNumber} />
                  <InfoRow
                    label="Giới tính"
                    value={genderLabel[tenant.gender]}
                  />
                  <InfoRow label="Email" value={tenant.email} />
                </InfoCard>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Thông tin thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatGroup>
                      <StatItem
                        label="Tiền thuê/tháng"
                        value={formatCurrency(tenant.rentAmount)}
                      />
                      <StatItem
                        label="Tiền cọc"
                        value={formatCurrency(tenant.depositAmount)}
                      />
                    </StatGroup>
                  </CardContent>
                </Card>
              </>
            ),
          },
          {
            value: "contracts",
            label: "Hợp đồng",
            content: (
              <RelationTab
                items={tenantContracts}
                className="space-y-3"
                empty={{
                  icon: ScrollText,
                  title: "Chưa có hợp đồng",
                  description: "Người thuê này chưa có hợp đồng nào.",
                }}
              >
                {(contract) => (
                  <EntityListCard
                    overlay={
                      <Link
                        to={ROUTES.contractDetailPath(contract.id)}
                        className="absolute inset-0 z-0"
                      />
                    }
                    header={
                      <CardHeader className="flex-row items-center justify-between gap-4 py-4">
                        <div>
                          <p className="font-medium">
                            {contract.contractNumber}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {contract.startDate} → {contract.endDate}
                          </p>
                        </div>
                        <StatusBadge
                          config={contractStatusConfig[contract.status]}
                        />
                      </CardHeader>
                    }
                    content={null}
                  />
                )}
              </RelationTab>
            ),
          },
          {
            value: "invoices",
            label: "Hoá đơn",
            content: (
              <RelationTab
                items={tenantInvoices}
                className="space-y-3"
                empty={{
                  title: "Chưa có hoá đơn",
                  description: "Người thuê này chưa có hoá đơn nào.",
                }}
              >
                {(invoice) => (
                  <EntityListCard
                    overlay={
                      <Link
                        to={ROUTES.invoiceDetailPath(invoice.id)}
                        className="absolute inset-0 z-0"
                      />
                    }
                    header={
                      <CardHeader className="flex-row items-center justify-between gap-4 py-4">
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-muted-foreground text-xs">
                            Kỳ {invoice.month} ·{" "}
                            {formatCurrency(invoice.amount)}
                          </p>
                        </div>
                        <StatusBadge
                          config={invoiceStatusConfig[invoice.status]}
                        />
                      </CardHeader>
                    }
                    content={null}
                  />
                )}
              </RelationTab>
            ),
          },
          {
            value: "residence",
            label: "Lưu trú",
            content: declaration ? (
              <ResidenceDeclarationLines
                declaration={declaration}
                hideTenantHeader
              />
            ) : (
              <EmptyPanel
                title="Không áp dụng Khai báo lưu trú"
                description="Người thuê hiện không có Hợp đồng hiệu lực."
                className="border"
              />
            ),
          },
        ]}
        sidebar={
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
        }
      />

      <TenantFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tenant={tenant}
      />
    </>
  );
}
