import * as React from "react";
import { Smile } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";

const EmojiPicker = React.lazy(() => import("@emoji-mart/react"));

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
 * sheet variant to maintain. The emoji data chunk is fetched only on the
 * first open, which is what keeps it out of the app's entry chunk.
 */
export default function MessageComposerEmojiPicker({
  onSelect,
}: MessageComposerEmojiPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [emojiData, setEmojiData] = React.useState<unknown>();

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen && !emojiData) {
          void import("@emoji-mart/data").then((module) =>
            setEmojiData(module.default),
          );
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Insert emoji"
          >
            <Smile className="size-5" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" side="top" align="start">
        {emojiData ? (
          <React.Suspense fallback={null}>
            <EmojiPicker
              data={emojiData}
              onEmojiSelect={(emoji: EmojiSelection) => {
                onSelect(emoji);
                setOpen(false);
              }}
              theme="light"
            />
          </React.Suspense>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
