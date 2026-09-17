import { BarChart3, MessageSquare, RotateCcw, Shield } from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

import type { Setting, SettingCategory } from "~/types/setting";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import ElectricityTierConfig from "~/features/settings/components/electricity-tier-config";
import SettingGroup from "~/features/settings/components/setting-group";
import { settingCategoryOrder } from "~/features/settings/constants/setting-categories";
import {
  useGetElectricityTierConfig,
  useGetSettings,
} from "~/hooks/api/setting";

const quickLinks = [
  { to: ROUTES.COMPLIANCE, label: "Tuân thủ", icon: Shield },
  { to: ROUTES.COMMUNICATIONS, label: "Liên lạc", icon: MessageSquare },
  { to: ROUTES.REPORTS, label: "Báo cáo", icon: BarChart3 },
];

const quickLinkClassName = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
);

/**
 * "Cài đặt hệ thống": the quick links, Giá điện bậc thang, then the four
 * read-only groups. "Khôi phục mặc định" has no flow yet, as in the prototype.
 */
export default function SettingsTemplate() {
  const settingsQuery = useGetSettings();
  const tierQuery = useGetElectricityTierConfig();

  const byCategory: Record<SettingCategory, Setting[]> = {
    building: [],
    rent: [],
    notification: [],
    billing: [],
  };
  for (const setting of settingsQuery.data ?? []) {
    byCategory[setting.category].push(setting);
  }

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Cài đặt hệ thống"
        description="Quản lý các cấu hình và thông tin cơ bản của hệ thống quản lý trọ."
        actions={
          <Button type="button" variant="outline" size="sm">
            <RotateCcw />
            Khôi phục mặc định
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tuân thủ & liên lạc</CardTitle>
          <CardDescription>
            Truy cập nhanh các màn hình hệ thống liên quan đến tuân thủ và gửi
            thông báo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={quickLinkClassName}>
              <Icon />
              {label}
            </Link>
          ))}
        </CardContent>
      </Card>

      {settingsQuery.isLoading || tierQuery.isLoading ? (
        <LoadingPanel className="lg:grid-cols-2" itemCount={4} />
      ) : settingsQuery.isError || tierQuery.isError || !tierQuery.data ? (
        <ErrorPanel
          description="Không thể tải cài đặt."
          action={{
            label: "Thử lại",
            onClick: () => {
              void settingsQuery.refetch();
              void tierQuery.refetch();
            },
          }}
        />
      ) : (
        <>
          <ElectricityTierConfig config={tierQuery.data} />
          <div className="space-y-4">
            {settingCategoryOrder.map((category) => (
              <SettingGroup
                key={category}
                category={category}
                settings={byCategory[category]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
