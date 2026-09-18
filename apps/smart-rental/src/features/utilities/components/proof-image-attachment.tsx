import { useState } from "react";
import { ImageOff } from "lucide-react";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@monorepo/ui/components/attachment";

interface ProofImageAttachmentProps {
  src: string;
  index: number;
}

/**
 * One "ảnh chứng từ" tile on "Chi tiết chỉ số điện nước" — a broken proof
 * image (the Mock's own paths are placeholders, per the prototype) falls
 * back to an icon and a label instead of a broken-image glyph.
 */
export default function ProofImageAttachment({
  src,
  index,
}: ProofImageAttachmentProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <Attachment orientation="vertical" state={hasError ? "error" : "done"}>
      <AttachmentMedia variant={hasError ? "icon" : "image"}>
        {hasError ? (
          <ImageOff />
        ) : (
          // biome-ignore lint/a11y/useAltText: AttachmentTitle below carries the label.
          <img src={src} onError={() => setHasError(true)} />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>Chứng từ {index + 1}</AttachmentTitle>
        {hasError && (
          <AttachmentDescription>Không tải được ảnh</AttachmentDescription>
        )}
      </AttachmentContent>
    </Attachment>
  );
}
