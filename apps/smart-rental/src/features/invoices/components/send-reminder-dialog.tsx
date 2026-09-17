import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@monorepo/ui/components/dialog";
import { Field, FieldLabel } from "@monorepo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";
import { toast } from "@monorepo/ui/components/toast";

import type { CommunicationChannel } from "~/types/communication";
import { channelConfig } from "~/constants/status";
import { useSendInvoiceReminders } from "~/hooks/api/invoice";

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceIds: string[];
  /** Called once the reminders were sent — the caller clears its own selection, if any. */
  onSent?: () => void;
}

/**
 * "Gửi nhắc" — chọn kênh, ghi nhật ký (spec #153 §10 row 12), reached both
 * from một Hoá đơn's own "Nhắc nợ" tab (`invoiceIds` length 1) và từ thanh
 * chọn hàng loạt của danh sách.
 */
export default function SendReminderDialog({
  open,
  onOpenChange,
  invoiceIds,
  onSent,
}: SendReminderDialogProps) {
  const [channel, setChannel] = useState<CommunicationChannel>("zalo");
  const sendReminders = useSendInvoiceReminders();

  const handleSend = () => {
    sendReminders.mutate(
      { invoiceIds, channel },
      {
        onSuccess: () => {
          toast.add({
            title: `Đã gửi nhắc qua ${channelConfig[channel].label} cho ${invoiceIds.length} hoá đơn`,
            type: "success",
          });
          onOpenChange(false);
          onSent?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Gửi nhắc thanh toán</DialogTitle>
          <DialogDescription>
            Chọn kênh gửi cho {invoiceIds.length} hoá đơn đã chọn.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="reminder-channel">Kênh gửi</FieldLabel>
          <Select
            value={channel}
            onValueChange={(value) => setChannel(value as CommunicationChannel)}
          >
            <SelectTrigger id="reminder-channel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(channelConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={sendReminders.isPending}
          >
            <Send />
            {sendReminders.isPending ? "Đang gửi…" : "Gửi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
