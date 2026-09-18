import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@monorepo/ui/components/toggle-group";

import type { SendLog, SendLogStatus } from "~/types/communication";
import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import {
  CardGridSkeleton,
  TableSkeleton,
} from "~/components/panel/loading-panel";
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

const TABS = ["templates", "logs"] as const;

const ALL_CHANNELS = "all";
type ChannelFilter = typeof ALL_CHANNELS | "zalo" | "sms" | "email";

const LOGS_ERROR = "Không thể tải nhật ký gửi tin.";

function countByStatus(logs: SendLog[], status: SendLogStatus) {
  return logs.filter((log) => log.status === status).length;
}

/**
 * "Thông báo" (spec #153 §10 row 26): mẫu tin theo cùng anatomy thẻ chung,
 * mỗi mẫu một nút "Dùng mẫu" — Gửi nhắc tự nó là nhật ký trên Hoá đơn,
 * slice này chỉ giữ mẫu và đọc nhật ký đã gửi. Tab con (kênh, lồng trong tab
 * cha) và "Thông báo tự động" (hai công tắc không nối gì) đều gỡ — research
 * C.1 #24.
 */
export default function CommunicationsTemplate() {
  const [tab, setTab] = useUrlTab(TABS);
  const [channelFilter, setChannelFilter] =
    useState<ChannelFilter>(ALL_CHANNELS);

  const templatesQuery = useGetNotificationTemplates();
  const logsQuery = useGetSendLogs();

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Thông báo"
        description="Gửi thông báo cho Người thuê qua nhiều kênh."
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="templates">Mẫu thông báo</TabsTrigger>
          <TabsTrigger value="logs">Nhật ký gửi tin</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="text-primary size-5" />
              Mẫu thông báo
            </h2>
            <ToggleGroup
              value={[channelFilter]}
              onValueChange={(next) => {
                const value = next[0];
                if (value) setChannelFilter(value as ChannelFilter);
              }}
              variant="outline"
              size="sm"
              spacing={0}
            >
              <ToggleGroupItem value={ALL_CHANNELS}>Tất cả</ToggleGroupItem>
              <ToggleGroupItem value="zalo">Zalo ZNS</ToggleGroupItem>
              <ToggleGroupItem value="sms">SMS</ToggleGroupItem>
              <ToggleGroupItem value="email">Email</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <QuerySection
            query={templatesQuery}
            errorText="Không thể tải mẫu thông báo."
            loading={<CardGridSkeleton itemCount={3} />}
          >
            {(templates) => {
              const visible =
                channelFilter === ALL_CHANNELS
                  ? templates
                  : templates.filter((t) => t.channel === channelFilter);

              return visible.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  title="Chưa có mẫu"
                  description="Chưa có mẫu thông báo nào cho kênh này."
                  className="border"
                />
              );
            }}
          </QuerySection>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <QuerySection
            query={logsQuery}
            errorText={LOGS_ERROR}
            loading={<KpiStripSkeleton />}
          >
            {(logs) => (
              <KpiStrip
                items={[
                  { label: "Tổng tin nhắn", value: logs.length },
                  { label: "Đã gửi", value: countByStatus(logs, "sent") },
                  { label: "Chờ gửi", value: countByStatus(logs, "pending") },
                  { label: "Thất bại", value: countByStatus(logs, "failed") },
                ]}
              />
            )}
          </QuerySection>

          <QuerySection
            query={logsQuery}
            errorText={LOGS_ERROR}
            loading={<TableSkeleton />}
          >
            {(logs) => (
              <DataTable
                columns={sendLogColumns}
                data={logs}
                getRowId={(log) => log.id}
                search={{
                  columnId: "tenant",
                  placeholder: "Tìm kiếm Người thuê...",
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
      </Tabs>
    </div>
  );
}
