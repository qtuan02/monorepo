import { BarChart3, Bell, RotateCcw, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { Setting, SettingCategory } from "~/types/setting";
import { ListPageHeader } from "~/components/page/list-page-header";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { QuerySection } from "~/components/panel/query-section";
import { ROUTES } from "~/constants/routes";
import ElectricityTierConfig from "~/features/settings/components/electricity-tier-config";
import SettingGroup from "~/features/settings/components/setting-group";
import { settingCategoryOrder } from "~/features/settings/constants/setting-categories";
import {
  useGetElectricityTierConfig,
  useGetSettings,
} from "~/hooks/api/setting";

const quickLinks = [
  { to: ROUTES.COMPLIANCE, label: "Khai báo lưu trú", icon: ShieldCheck },
  { to: ROUTES.COMMUNICATIONS, label: "Thông báo", icon: Bell },
  { to: ROUTES.REPORTS, label: "Báo cáo", icon: BarChart3 },
];

const quickLinkClassName = buttonVariants({ variant: "outline", size: "sm" });

function groupByCategory(settings: Setting[]) {
  const byCategory: Record<SettingCategory, Setting[]> = {
    building: [],
    rent: [],
    notification: [],
    billing: [],
  };
  for (const setting of settings) byCategory[setting.category].push(setting);
  return byCategory;
}

/**
 * "Cài đặt hệ thống": the quick links, Giá điện bậc thang, then the four
 * read-only groups — two queries, each section gated on its own. "Khôi phục
 * mặc định" has no flow yet, as in the prototype.
 */
export default function SettingsTemplate() {
  const settingsQuery = useGetSettings();
  const tierQuery = useGetElectricityTierConfig();

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
          <CardTitle className="text-base">
            Khai báo lưu trú & thông báo
          </CardTitle>
          <CardDescription>
            Truy cập nhanh các màn hình hệ thống liên quan đến khai báo lưu trú
            và gửi thông báo.
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

      <QuerySection
        query={tierQuery}
        errorText="Không thể tải cấu hình điện bậc thang."
        loading={<LoadingPanel className="lg:grid-cols-1" itemCount={1} />}
      >
        {(config) => <ElectricityTierConfig config={config} />}
      </QuerySection>

      <QuerySection
        query={settingsQuery}
        errorText="Không thể tải cài đặt."
        loading={<LoadingPanel className="lg:grid-cols-2" itemCount={4} />}
      >
        {(settings) => {
          const byCategory = groupByCategory(settings);
          return (
            <div className="space-y-4">
              {settingCategoryOrder.map((category) => (
                <SettingGroup
                  key={category}
                  category={category}
                  settings={byCategory[category]}
                />
              ))}
            </div>
          );
        }}
      </QuerySection>
    </div>
  );
}
