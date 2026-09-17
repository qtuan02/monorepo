import { useState } from "react";
import { ImageOff } from "lucide-react";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@monorepo/ui/components/attachment";

interface ReceiptAttachmentProps {
  /** A URL, or absent/empty when the record carries no receipt/invoice image. */
  src?: string;
  /** "Biên lai", "Hoá đơn" — the label spec #153 §3.4/§3.5 calls "ảnh chứng từ". */
  label: string;
}

/**
 * One "ảnh chứng từ" tile — a broken or absent image falls back to an icon
 * and a label instead of a broken-image glyph (spec #153 §3.4, §4: "Ảnh
 * chứng từ: `attachment.tsx` có fallback"). The Chi phí/Hoá đơn nhà cung cấp
 * counterpart of `~/features/utilities/components/proof-image-attachment.tsx`
 * — single-image rather than an indexed list, so it stays its own component.
 */
export function ReceiptAttachment({ src, label }: ReceiptAttachmentProps) {
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return (
      <p className="text-muted-foreground text-sm italic">
        Chưa có ảnh {label.toLowerCase()}.
      </p>
    );
  }

  return (
    <Attachment
      orientation="vertical"
      state={hasError ? "error" : "done"}
      className="w-full"
    >
      <AttachmentMedia
        variant={hasError ? "icon" : "image"}
        className="aspect-video w-full"
      >
        {hasError ? (
          <ImageOff />
        ) : (
          // biome-ignore lint/a11y/useAltText: AttachmentTitle below carries the label.
          <img src={src} onError={() => setHasError(true)} />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{label}</AttachmentTitle>
        {hasError && (
          <AttachmentDescription>Không tải được ảnh</AttachmentDescription>
        )}
      </AttachmentContent>
    </Attachment>
  );
}
