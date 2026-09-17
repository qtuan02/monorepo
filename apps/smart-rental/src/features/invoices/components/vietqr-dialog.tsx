import { Download, QrCode, Share2 } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@monorepo/ui/components/dialog";

import { formatCurrency } from "~/utils/currency";

interface VietQrDialogProps {
  amount: number;
  invoiceNumber: string;
}

// The prototype's placeholder QR: 25 cells, on/off by `(i * 7) % 10 > 3`.
// Named so no key is a bare index; a real VietQR image replaces the grid.
const QR_CELLS = Array.from({ length: 25 }, (_, i) => ({
  key: `qr-${i}`,
  isOn: (i * 7) % 10 > 3,
}));

/** "Thanh toán VietQR": a mock code with the amount and transfer note under it. */
export default function VietQrDialog({
  amount,
  invoiceNumber,
}: VietQrDialogProps) {
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
            Quét mã QR dưới đây bằng ứng dụng ngân hàng để thanh toán hóa đơn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div
            role="img"
            aria-label={`Mã VietQR cho ${invoiceNumber}`}
            className="border-primary relative flex size-48 items-center justify-center rounded-xl border-4 bg-white shadow-lg"
          >
            <div className="absolute inset-2 grid grid-cols-5 grid-rows-5 gap-1 opacity-80">
              {QR_CELLS.map((cell) => (
                <div
                  key={cell.key}
                  className={cell.isOn ? "bg-primary rounded-xs" : ""}
                />
              ))}
            </div>
            <div className="absolute flex size-12 items-center justify-center rounded-lg border bg-white p-1 shadow-sm">
              <QrCode className="text-primary size-8" />
            </div>
          </div>

          <div className="space-y-1 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              Số tiền thanh toán
            </p>
            <p className="text-primary text-2xl font-bold tabular-nums">
              {formatCurrency(amount)}
            </p>
            <p className="text-muted-foreground pt-2 text-xs">
              Nội dung:{" "}
              <span className="bg-muted rounded px-1 py-0.5 font-mono">
                Thanh toan {invoiceNumber}
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline">
            <Share2 />
            Chia sẻ
          </Button>
          <Button type="button">
            <Download />
            Lưu ảnh QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
