import { AlertCircle, QrCode } from "lucide-react";
import { Link } from "react-router";

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

import type { BankAccount } from "~/types/building";
import { ROUTES } from "~/constants/routes";
import { formatCurrency } from "~/utils/currency";
import { buildVietQrQuickLink, toVietQrAddInfo } from "~/utils/vietqr";

interface VietQrDialogProps {
  /** Còn phải trả — `invoice.amount - invoice.paidAmount`, not the invoice total. */
  amount: number;
  invoiceNumber: string;
  room: string;
  /** Absent when the Toà nhà has no Tài khoản nhận tiền yet — no VietQR without it. */
  bankAccount: BankAccount | undefined;
  /** For the "Toà nhà chưa khai..." warning's own link to Cài đặt Toà nhà (spec #153 §10 row 12). */
  buildingId: string;
}

/**
 * "Thanh toán VietQR" (spec #153 §10 row 12): a real `img.vietqr.io` link
 * built from the Toà nhà's Tài khoản nhận tiền, never a fake QR grid — a
 * Toà nhà with none yet gets the warning (with a link to its own Cài đặt) instead.
 */
export default function VietQrDialog({
  amount,
  invoiceNumber,
  room,
  bankAccount,
  buildingId,
}: VietQrDialogProps) {
  const link = buildVietQrQuickLink(
    bankAccount,
    amount,
    `${invoiceNumber} ${room}`,
  );

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" className="w-full">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
