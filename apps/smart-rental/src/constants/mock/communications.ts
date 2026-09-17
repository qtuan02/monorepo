import type { NotificationTemplate, SendLog } from "~/types/communication";

/** The Mock every Thông báo read comes from (spec #127). */
export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: "T001",
    name: "ZNS: Nhắc đóng tiền nhà",
    channel: "zalo",
    description: "Mẫu Zalo ZNS nhắc nhở thanh toán hóa đơn hàng tháng",
    preview:
      "Chào bạn, hóa đơn tiền nhà tháng này là {amount}đ. Vui lòng thanh toán trước ngày {dueDate}.",
  },
  {
    id: "T002",
    name: "Thông báo bảo trì",
    channel: "email",
    description: "Thông báo về công việc bảo trì phòng",
    preview: "Chúng tôi sẽ tiến hành bảo trì phòng vào ngày...",
  },
  {
    id: "T003",
    name: "ZNS: Sắp hết hạn hợp đồng",
    channel: "zalo",
    description: "Mẫu Zalo ZNS thông báo hợp đồng sắp hết hạn",
    preview:
      "Hợp đồng phòng {room} của bạn sắp hết hạn vào ngày {endDate}. Vui lòng liên hệ quản lý để gia hạn.",
  },
];

export const mockSendLogs: SendLog[] = [
  {
    id: "SL001",
    tenant: "Nguyễn Văn An",
    template: "Thông báo thanh toán",
    channel: "sms",
    status: "sent",
    sentDate: "22/04/2026",
    recipient: "0912345678",
  },
  {
    id: "SL002",
    tenant: "Trần Thị Bình",
    template: "Thông báo bảo trì",
    channel: "email",
    status: "sent",
    sentDate: "21/04/2026",
    recipient: "binh@email.com",
  },
  {
    id: "SL003",
    tenant: "Lê Văn Chiến",
    template: "Thông báo gia hạn hợp đồng",
    channel: "zalo",
    status: "failed",
    sentDate: "20/04/2026",
    recipient: "0987654321",
  },
];
