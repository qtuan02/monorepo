import type { Emoji } from "frimousse";
import * as React from "react";
import { Smile } from "lucide-react";
import { useTranslation } from "react-i18next";

import { InputGroupButton } from "@monorepo/ui/components/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";

interface EmojiSelection {
  native?: string;
}

interface MessageComposerEmojiPickerProps {
  onSelect: (emoji: EmojiSelection) => void;
}

/**
 * One `Picker` for both mobile and desktop (Q12, spec #195) — the
 * `Popover` primitive already gives it a position on desktop and an
 * outside-click/Escape close on either, so there's no separate mobile
 * sheet variant to maintain. `frimousse` (replacing `emoji-mart`, which
 * rendered every emoji up front and janked on first open) virtualizes
 * the grid itself and fetches+caches its own data, so this wrapper only
 * needs to code-split the package out of the entry chunk and mount it
 * on first open — no manual data fetch.
 */
const EmojiPickerPanel = React.lazy(
  () =>
    import(
      "~/features/conversation/components/message-composer-emoji-picker-panel"
    ),
);

export default function MessageComposerEmojiPicker({
  onSelect,
}: MessageComposerEmojiPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("chat.convPane.composer.insertEmoji")}
            className="text-muted-foreground hover:text-foreground rounded-full"
          >
            <Smile className="size-4.5" />
          </InputGroupButton>
        }
      />
      <PopoverContent className="w-auto p-0" side="top" align="end">
        {open && (
          <React.Suspense fallback={null}>
            <EmojiPickerPanel
              onEmojiSelect={(emoji: Emoji) => {
                onSelect({ native: emoji.emoji });
                setOpen(false);
              }}
            />
          </React.Suspense>
        )}
      </PopoverContent>
    </Popover>
  );
}
