import { useState } from "react";
import { Bell, Mail, MessageSquare, Send } from "lucide-react";

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

import type { SendLog, SendLogStatus } from "~/types/communication";
import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { QuerySection } from "~/components/panel/query-section";
import {
  channelConfig,
  sendLogStatusConfig,
  toFilterOptions,
} from "~/constants/status";
import { sendLogColumns } from "~/features/communications/components/send-log-columns";
import TemplateCard from "~/features/communications/components/template-card";
import { useGetNotificationTemplates } from "~/hooks/api/notification-template";
import { useGetSendLogs } from "~/hooks/api/send-log";
import { useUrlTab } from "~/hooks/use-url-tab";

const TABS = ["overview", "logs", "automation"] as const;

const ALL_CHANNELS = "all";
type ChannelTab = typeof ALL_CHANNELS | "zalo" | "sms" | "email";

const LOGS_ERROR = "Không thể tải nhật ký gửi tin.";

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

function countByStatus(logs: SendLog[], status: SendLogStatus) {
  return logs.filter((log) => log.status === status).length;
}

/**
 * "Liên lạc" (Thông báo): the tab rides on the URL — "Tổng quan & Mẫu tin"
 * with a count per send status and the templates by channel, "Nhật ký gửi
 * tin" on the list composite, and the two automation switches. Two queries,
 * each section gated on its own.
 */
export default function CommunicationsTemplate() {
  const [tab, setTab] = useUrlTab(TABS);
  const [channelTab, setChannelTab] = useState<ChannelTab>(ALL_CHANNELS);

  const templatesQuery = useGetNotificationTemplates();
  const logsQuery = useGetSendLogs();

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Liên lạc"
        description="Gửi thông báo cho khách thuê qua nhiều kênh."
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Tổng quan & Mẫu tin</TabsTrigger>
          <TabsTrigger value="logs">Nhật ký gửi tin</TabsTrigger>
          <TabsTrigger value="automation">Thông báo tự động</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <QuerySection
            query={logsQuery}
            errorText={LOGS_ERROR}
            loading={<LoadingPanel className="md:grid-cols-4" itemCount={4} />}
          >
            {(logs) => (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  label="Tổng tin nhắn"
                  value={logs.length}
                  icon={Bell}
                />
                <SummaryCard
                  label="Đã gửi"
                  value={countByStatus(logs, "sent")}
                  icon={Send}
                  iconClassName="bg-emerald-100 text-emerald-600"
                />
                <SummaryCard
                  label="Chờ gửi"
                  value={countByStatus(logs, "pending")}
                  icon={MessageSquare}
                  iconClassName="bg-blue-100 text-blue-600"
                />
                <SummaryCard
                  label="Thất bại"
                  value={countByStatus(logs, "failed")}
                  icon={Mail}
                  iconClassName="bg-red-100 text-red-600"
                />
              </div>
            )}
          </QuerySection>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="text-primary size-5" />
              Mẫu thông báo
            </h2>

            <QuerySection
              query={templatesQuery}
              errorText="Không thể tải mẫu thông báo."
            >
              {(templates) => {
                const visible =
                  channelTab === ALL_CHANNELS
                    ? templates
                    : templates.filter((t) => t.channel === channelTab);

                return templates.length > 0 ? (
                  <Tabs
                    value={channelTab}
                    onValueChange={(value) =>
                      setChannelTab(value as ChannelTab)
                    }
                    className="space-y-6"
                  >
                    <TabsList>
                      <TabsTrigger value={ALL_CHANNELS}>Tất cả</TabsTrigger>
                      <TabsTrigger value="zalo">Zalo ZNS</TabsTrigger>
                      <TabsTrigger value="sms">SMS</TabsTrigger>
                      <TabsTrigger value="email">Email</TabsTrigger>
                    </TabsList>
                    <TabsContent value={channelTab}>
                      {visible.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {visible.map((template) => (
                            <TemplateCard
                              key={template.id}
                              template={template}
                            />
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
                );
              }}
            </QuerySection>
          </section>
        </TabsContent>

        <TabsContent value="logs">
          <QuerySection query={logsQuery} errorText={LOGS_ERROR}>
            {(logs) => (
              <DataTable
                columns={sendLogColumns}
                data={logs}
                getRowId={(log) => log.id}
                search={{
                  columnId: "tenant",
                  placeholder: "Tìm kiếm khách...",
                }}
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
            )}
          </QuerySection>
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
