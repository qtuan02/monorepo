import { useState } from "react";
import { Bell, Mail, MessageSquare, Send } from "lucide-react";
import { useSearchParams } from "react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Switch } from "@monorepo/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";

import type { SendLogStatus } from "~/types/communication";
import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import {
  channelConfig,
  sendLogStatusConfig,
  toFilterOptions,
} from "~/constants/status";
import { sendLogColumns } from "~/features/communications/components/send-log-columns";
import TemplateCard from "~/features/communications/components/template-card";
import {
  useGetNotificationTemplates,
  useGetSendLogs,
} from "~/hooks/api/communication";

const TAB_PARAM = "tab";
const TABS = ["overview", "logs", "automation"] as const;
type Tab = (typeof TABS)[number];

const ALL_CHANNELS = "all";
type ChannelTab = typeof ALL_CHANNELS | "zalo" | "sms" | "email";

/** The two rules the prototype showed; neither is wired to anything yet. */
const automationRules = [
  {
    key: "invoice-reminder",
    label: "Nhắc nợ hóa đơn",
    description: "Tự động gửi tin khi có hóa đơn mới (Kênh Zalo)",
    isOn: true,
  },
  {
    key: "contract-expiry",
    label: "Hết hạn hợp đồng",
    description: "Gửi tin trước 30 ngày khi hợp đồng sắp hết hạn",
    isOn: false,
  },
];

/**
 * "Liên lạc" (Thông báo): the tab rides on the URL — "Tổng quan & Mẫu tin"
 * with a count per send status and the templates by channel, "Nhật ký gửi
 * tin" on the list composite, and the two automation switches.
 */
export default function CommunicationsTemplate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get(TAB_PARAM);
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "overview";
  const [channelTab, setChannelTab] = useState<ChannelTab>(ALL_CHANNELS);

  const templatesQuery = useGetNotificationTemplates();
  const logsQuery = useGetSendLogs();

  const setTab = (next: string) =>
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === "overview") params.delete(TAB_PARAM);
        else params.set(TAB_PARAM, next);
        return params;
      },
      { replace: true },
    );

  const templates = templatesQuery.data ?? [];
  const logs = logsQuery.data ?? [];
  const visibleTemplates =
    channelTab === ALL_CHANNELS
      ? templates
      : templates.filter((template) => template.channel === channelTab);
  const countByStatus = (status: SendLogStatus) =>
    logs.filter((log) => log.status === status).length;

  if (templatesQuery.isLoading || logsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <CommunicationsHeader />
        <LoadingPanel className="md:grid-cols-4" itemCount={4} />
      </div>
    );
  }

  if (templatesQuery.isError || logsQuery.isError) {
    return (
      <div className="space-y-6">
        <CommunicationsHeader />
        <ErrorPanel
          description="Không thể tải dữ liệu liên lạc."
          action={{
            label: "Thử lại",
            onClick: () => {
              void templatesQuery.refetch();
              void logsQuery.refetch();
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommunicationsHeader />

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Tổng quan & Mẫu tin</TabsTrigger>
          <TabsTrigger value="logs">Nhật ký gửi tin</TabsTrigger>
          <TabsTrigger value="automation">Thông báo tự động</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Tổng tin nhắn"
              value={logs.length}
              icon={Bell}
            />
            <SummaryCard
              label="Đã gửi"
              value={countByStatus("sent")}
              icon={Send}
              iconClassName="bg-emerald-100 text-emerald-600"
            />
            <SummaryCard
              label="Chờ gửi"
              value={countByStatus("pending")}
              icon={MessageSquare}
              iconClassName="bg-blue-100 text-blue-600"
            />
            <SummaryCard
              label="Thất bại"
              value={countByStatus("failed")}
              icon={Mail}
              iconClassName="bg-red-100 text-red-600"
            />
          </div>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="text-primary size-5" />
              Mẫu thông báo
            </h2>

            {templates.length > 0 ? (
              <Tabs
                value={channelTab}
                onValueChange={(value) => setChannelTab(value as ChannelTab)}
                className="space-y-6"
              >
                <TabsList>
                  <TabsTrigger value={ALL_CHANNELS}>Tất cả</TabsTrigger>
                  <TabsTrigger value="zalo">Zalo ZNS</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                <TabsContent value={channelTab}>
                  {visibleTemplates.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {visibleTemplates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                      ))}
                    </div>
                  ) : (
                    <EmptyPanel
                      title="Chưa có mẫu"
                      description="Chưa có mẫu thông báo nào cho kênh này."
                      className="border"
                    />
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <EmptyPanel
                title="Chưa có mẫu"
                description="Thêm mẫu thông báo để gửi nhanh cho khách thuê."
                className="border"
              />
            )}
          </section>
        </TabsContent>

        <TabsContent value="logs">
          <DataTable
            columns={sendLogColumns}
            data={logs}
            getRowId={(log) => log.id}
            search={{ columnId: "tenant", placeholder: "Tìm kiếm khách..." }}
            facets={[
              {
                columnId: "channel",
                title: "Kênh",
                options: toFilterOptions(channelConfig),
              },
              {
                columnId: "status",
                title: "Trạng thái",
                options: toFilterOptions(sendLogStatusConfig),
              },
            ]}
            empty={{
              icon: Send,
              title: "Không có nhật ký phù hợp",
              description: "Thử đổi bộ lọc hoặc từ khóa tìm kiếm.",
            }}
            resultLabel={(count) => `${count} tin đã gửi`}
          />
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình gửi thông báo tự động</CardTitle>
              <CardDescription>
                Thiết lập các sự kiện để hệ thống tự động gửi tin cho khách thuê
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {automationRules.map((rule) => (
                <div
                  key={rule.key}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{rule.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {rule.description}
                    </p>
                  </div>
                  <Switch defaultChecked={rule.isOn} aria-label={rule.label} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommunicationsHeader() {
  return (
    <ListPageHeader
      title="Liên lạc"
      description="Gửi thông báo cho khách thuê qua nhiều kênh."
    />
  );
}
