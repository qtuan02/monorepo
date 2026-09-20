import { Paperclip, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { InputGroupButton } from "@monorepo/ui/components/input-group";
import { Spinner } from "@monorepo/ui/components/spinner";

import type { ComposerAttachment } from "~/features/conversation/hooks/use-message-composer";

interface MessageComposerAttachmentProps {
  attachment: ComposerAttachment;
  onRemove: () => void;
}

/** The tệp-đang-tải / tệp-đã-sẵn-sàng chip above the composer (T2, spec #253) —
 * no thumbnail and no progress bar, both out of scope. */
export default function MessageComposerAttachment({
  attachment,
  onRemove,
}: MessageComposerAttachmentProps) {
  const { t } = useTranslation();
  const isUploading = attachment.status === "uploading";

  return (
    <div className="bg-background mb-2 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
      {isUploading ? (
        <Spinner className="size-4 shrink-0" />
      ) : (
        <Paperclip className="text-muted-foreground size-4 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate">{attachment.fileName}</span>
      <InputGroupButton
        type="button"
        size="icon-xs"
        onClick={onRemove}
        aria-label={t("chat.attachment.removeAttachment")}
      >
        <X className="size-3.5" />
      </InputGroupButton>
    </div>
  );
}
