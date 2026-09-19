/** The prototype's communications shapes (Thông báo), kept 1:1. */
export type CommunicationChannel = "sms" | "email" | "zalo" | "in_app";

export type SendLogStatus = "sent" | "failed" | "pending";

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: CommunicationChannel;
  description: string;
  preview: string;
}

export interface SendLog {
  id: string;
  tenant: string;
  template: string;
  channel: CommunicationChannel;
  status: SendLogStatus;
  /** ISO `YYYY-MM-DD`. */
  sentDate: string;
  recipient: string;
}
