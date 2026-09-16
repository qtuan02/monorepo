import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  Bell,
  CheckCheck,
  FileText,
  ReceiptText,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";
import { ScrollArea } from "@monorepo/ui/components/scroll-area";
import { Separator } from "@monorepo/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";
import { cn } from "@monorepo/ui/utils/cn";

type NotificationType =
  | "invoice"
  | "contract"
  | "maintenance"
  | "tenant"
  | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

const notificationTypeConfig: Record<
  NotificationType,
  { icon: LucideIcon; colorClass: string; bgClass: string }
> = {
  invoice: {
    icon: ReceiptText,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-100",
  },
  contract: {
    icon: FileText,
    colorClass: "text-blue-600",
    bgClass: "bg-blue-100",
  },
  maintenance: {
    icon: Wrench,
    colorClass: "text-red-600",
    bgClass: "bg-red-100",
  },
  tenant: {
    icon: Users,
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-100",
  },
  system: {
    icon: Settings,
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
};

// The prototype's sample feed, local to this panel: nothing else reads it, and
// marking one read is view state rather than a Mock behind a hook.
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "invoice",
    title: "Hóa đơn quá hạn",
    description: "Phòng 204 chưa thanh toán hóa đơn tháng 4, quá hạn 2 ngày.",
    time: "5 phút trước",
    isRead: false,
  },
  {
    id: "2",
    type: "maintenance",
    title: "Yêu cầu bảo trì",
    description: "Phòng 108 báo cáo vòi nước bị rò rỉ, cần xử lý gấp.",
    time: "1 giờ trước",
    isRead: false,
  },
  {
    id: "3",
    type: "contract",
    title: "Hợp đồng sắp hết hạn",
    description: "Hợp đồng phòng 302 (Lê Thị C) sẽ hết hạn trong 3 ngày nữa.",
    time: "2 giờ trước",
    isRead: false,
  },
  {
    id: "4",
    type: "tenant",
    title: "Khách thuê mới",
    description: "Trần Văn B đã ký hợp đồng và nhận phòng 201 thành công.",
    time: "3 giờ trước",
    isRead: true,
  },
  {
    id: "5",
    type: "invoice",
    title: "Thanh toán thành công",
    description: "Phòng 105 đã thanh toán đủ hóa đơn tháng 4 – 3,000,000 đ.",
    time: "5 giờ trước",
    isRead: true,
  },
  {
    id: "6",
    type: "system",
    title: "Cập nhật hệ thống",
    description: "Hệ thống đã được cập nhật lên phiên bản 2.1.0 thành công.",
    time: "1 ngày trước",
    isRead: true,
  },
];

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const config = notificationTypeConfig[notification.type];

  return (
    <button
      type="button"
      onClick={() => onMarkRead(notification.id)}
      className={cn(
        "hover:bg-muted/60 flex w-full gap-3 px-4 py-3.5 text-left transition-colors",
        !notification.isRead && "bg-primary/5 hover:bg-primary/10",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          config.bgClass,
        )}
      >
        <config.icon className={cn("size-4", config.colorClass)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-foreground text-sm leading-tight",
              notification.isRead ? "font-normal" : "font-semibold",
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="bg-primary mt-1 size-2 shrink-0 rounded-full" />
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
          {notification.description}
        </p>
        <p className="text-muted-foreground/70 mt-1 text-[11px]">
          {notification.time}
        </p>
      </div>
    </button>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

function NotificationList({
  notifications,
  onMarkRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted mb-3 flex size-10 items-center justify-center rounded-full">
          <Bell className="text-muted-foreground size-5 opacity-50" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          Không có thông báo mới
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}

/** The bell in the header and the feed it opens, read state kept locally. */
export default function NotificationPanel() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unread = notifications.filter((n) => !n.isRead);
  const unreadCount = unread.length;
  const tabs = [
    ["all", notifications],
    ["unread", unread],
  ] as const;

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Thông báo"
            className="text-muted-foreground hover:text-foreground relative"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full text-[9px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-95 gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Thông báo</h3>
            {unreadCount > 0 && (
              <Badge className="h-5 px-1.5 text-[11px]">
                {unreadCount} mới
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
            >
              <CheckCheck />
              Đánh dấu đã đọc
            </Button>
          )}
        </div>

        <Tabs defaultValue="all">
          <div className="px-4 pt-2">
            <TabsList className="h-8 w-full">
              <TabsTrigger value="all" className="text-xs">
                Tất cả
                <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                  {notifications.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Chưa đọc
                {unreadCount > 0 && (
                  <span className="bg-primary/15 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {tabs.map(([value, list]) => (
            <TabsContent key={value} value={value}>
              <ScrollArea className="h-80">
                <NotificationList notifications={list} onMarkRead={markRead} />
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <Separator />
        <div className="px-4 py-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground w-full text-xs"
          >
            Xem tất cả thông báo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
