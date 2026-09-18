import { useState } from "react";
import { AlertCircle, QrCode } from "lucide-react";
import { Link } from "react-router";

import dayjs from "@monorepo/dayjs";
import { Alert, AlertDescription } from "@monorepo/ui/components/alert";
import { Button } from "@monorepo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@monorepo/ui/components/dialog";
import { toast } from "@monorepo/ui/components/toast";

import type { BankAccount } from "~/types/building";
import { ROUTES } from "~/constants/routes";
import { useRecordInvoicePayment } from "~/hooks/api/invoice";
import { formatCurrency } from "~/utils/currency";
import { buildVietQrQuickLink, toVietQrAddInfo } from "~/utils/vietqr";

interface VietQrDialogProps {
  invoiceId: string;
  /** Còn phải trả — `invoice.amount - invoice.paidAmount`, not the invoice total. */
  amount: number;
  invoiceNumber: string;
  room: string;
  /** Absent when the Toà nhà has no Tài khoản nhận tiền yet — no VietQR without it. */
  bankAccount: BankAccount | undefined;
  /** For the "Toà nhà chưa khai..." warning's own link to Cài đặt Toà nhà (spec #153 §10 row 12). */
  buildingId: string;
  /** The trigger's own look — defaults to a full-width primary button (a sidebar card's shape). */
  variant?: "default" | "outline";
  size?: "default" | "sm";
  className?: string;
}

/**
 * "Thanh toán VietQR" (spec #153 §10 row 12): a real `img.vietqr.io` link
 * built from the Toà nhà's Tài khoản nhận tiền, never a fake QR grid — a
 * Toà nhà with none yet gets the warning (with a link to its own Cài đặt)
 * instead. "Đã nhận" (spec #179 §"Thu tiền và chi tiết Hoá đơn") records the
 * same amount as a Thanh toán chuyển khoản hôm nay through the same mutation
 * `~/components/sheet/payment-form-sheet` uses, without leaving the dialog.
 * The trigger disappears once there is nothing left to collect. Shared by a
 * Hoá đơn's own detail header and Hôm nay's grouped Hoá đơn quá hạn mục (see
 * [[architecture-shared-components]]).
 */
export default function VietQrDialog({
  invoiceId,
  amount,
  invoiceNumber,
  room,
  bankAccount,
  buildingId,
  variant = "default",
  size = "default",
  className = "w-full",
}: VietQrDialogProps) {
  const [open, setOpen] = useState(false);
  const recordPayment = useRecordInvoicePayment();
  const link = buildVietQrQuickLink(
    bankAccount,
    amount,
    `${invoiceNumber} ${room}`,
  );

  if (amount <= 0) return null;

  const handleReceived = () => {
    recordPayment.mutate(
      {
        invoiceId,
        amount,
        method: "BANK_TRANSFER",
        paidAt: dayjs().format("YYYY-MM-DD"),
      },
      {
        onSuccess: () => {
          toast.add({
            title: `Đã ghi nhận thanh toán cho ${invoiceNumber}`,
            type: "success",
          });
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
          >
            <QrCode />
            Thanh toán VietQR
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Mã thanh toán VietQR</DialogTitle>
          <DialogDescription>
            Quét mã QR dưới đây bằng ứng dụng ngân hàng để thanh toán hoá đơn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {link ? (
            <img
              src={link}
              alt={`Mã VietQR cho ${invoiceNumber}`}
              className="border-primary size-48 rounded-xl border-4 bg-white shadow-lg"
            />
          ) : (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>
                <p>
                  Toà nhà chưa khai Tài khoản nhận tiền — chưa thể tạo mã
                  VietQR.
                </p>
                <Link to={ROUTES.buildingDetailPath(buildingId)}>
                  Đi tới Cài đặt Toà nhà
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              Số tiền thanh toán
            </p>
            <p className="text-primary text-2xl font-bold tabular-nums">
              {formatCurrency(amount)}
            </p>
            {link && (
              <p className="text-muted-foreground pt-2 text-xs">
                Nội dung:{" "}
                <span className="bg-muted rounded px-1 py-0.5 font-mono">
                  {toVietQrAddInfo(`${invoiceNumber} ${room}`)}
                </span>
              </p>
            )}
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={recordPayment.isPending}
            onClick={handleReceived}
          >
            Đã nhận {formatCurrency(amount)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
