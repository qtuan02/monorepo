import type { Emoji, EmojiPickerListCategoryHeaderProps } from "frimousse";
import { EmojiPicker } from "frimousse";

interface MessageComposerEmojiPickerPanelProps {
  onEmojiSelect: (emoji: Emoji) => void;
}

function EmojiCategoryHeader({
  category,
  ...props
}: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      {...props}
      className="bg-popover text-muted-foreground px-2 py-1.5 text-xs font-medium"
    >
      {category.label}
    </div>
  );
}

/**
 * The whole `frimousse` tree, isolated in its own module so
 * `React.lazy(() => import(...))` in the picker button keeps this
 * package's code out of the app's entry chunk — importing any of these
 * named exports anywhere else statically would defeat that split.
 */
export default function MessageComposerEmojiPickerPanel({
  onEmojiSelect,
}: MessageComposerEmojiPickerPanelProps) {
  return (
    <EmojiPicker.Root
      className="isolate flex h-80 w-72 flex-col"
      onEmojiSelect={onEmojiSelect}
    >
      <EmojiPicker.Search className="border-border bg-background mx-2 mt-2 rounded-md border px-3 py-1.5 text-sm outline-none" />
      <EmojiPicker.Viewport className="flex-1 overflow-y-auto px-2 pb-2">
        <EmojiPicker.Loading className="text-muted-foreground flex h-full items-center justify-center text-sm">
          Đang tải…
        </EmojiPicker.Loading>
        <EmojiPicker.Empty className="text-muted-foreground flex h-full items-center justify-center text-sm">
          Không tìm thấy emoji.
        </EmojiPicker.Empty>
        <EmojiPicker.List
          components={{ CategoryHeader: EmojiCategoryHeader }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
