import type { LucideIcon } from "lucide-react";
import * as React from "react";
import {
  Hand,
  Hash,
  Leaf,
  Lightbulb,
  Pizza,
  Plane,
  Search,
  Smile,
  Trophy,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@monorepo/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@monorepo/ui/components/tabs";
import { cn } from "@monorepo/ui/utils/cn";

import emojiData from "~/assets/emoji/emoji-data.json";

interface MessageComposerEmojiPickerPanelProps {
  onEmojiSelect: (emoji: string) => void;
}

/** `[group index, emoji, label, tags]` — see scripts/build-emoji-data.ts. */
type EmojiRow = [number, string, string, string];

const GROUP_ICONS: Record<string, LucideIcon> = {
  "smileys-emotion": Smile,
  "people-body": Hand,
  "animals-nature": Leaf,
  "food-drink": Pizza,
  "travel-places": Plane,
  activities: Trophy,
  objects: Lightbulb,
  symbols: Hash,
};

const { groups } = emojiData;
const rows = emojiData.emoji as EmojiRow[];

/**
 * Messenger-shaped: one category on screen at a time, picked from an icon
 * tab bar, so a tab is a few hundred plain buttons rather than the whole
 * set — no virtualizer, no network fetch (the data is a committed asset).
 * A search term overrides the tab and matches label + tags across every
 * category; `useDeferredValue` keeps typing responsive while the grid
 * re-filters behind it.
 */
export default function MessageComposerEmojiPickerPanel({
  onEmojiSelect,
}: MessageComposerEmojiPickerPanelProps) {
  const { t } = useTranslation();
  const searchInputId = React.useId();
  const [group, setGroup] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const term = React.useDeferredValue(search.trim().toLowerCase());

  const visible = term
    ? rows.filter(([, , label, tags]) => `${label} ${tags}`.includes(term))
    : rows.filter(([index]) => index === group);
  const heading = term
    ? undefined
    : t(`chat.convPane.emoji.groups.${groups[group]}`);

  return (
    <div className="isolate flex h-96 w-80 flex-col">
      <label
        className="text-muted-foreground relative m-2 block"
        htmlFor={searchInputId}
      >
        <span className="sr-only">
          {t("chat.convPane.emoji.searchPlaceholder")}
        </span>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          id={searchInputId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("chat.convPane.emoji.searchPlaceholder")}
          className="h-9 rounded-full pl-8"
        />
      </label>

      <Tabs
        value={String(group)}
        onValueChange={(value) => setGroup(Number(value))}
        className="gap-0"
      >
        {/* Same active pill as the Friends tabs and the All·Unread·Groups
            chips: `--foreground` says "where am I" (brief §10). */}
        <TabsList className="group-data-horizontal/tabs:h-9 mx-2 w-auto rounded-full p-1">
          {groups.map((key, index) => {
            const Icon = GROUP_ICONS[key] ?? Smile;
            return (
              <TabsTrigger
                key={key}
                value={String(index)}
                aria-label={t(`chat.convPane.emoji.groups.${key}`)}
                className="h-7 rounded-full px-0 data-active:bg-foreground data-active:text-background data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-foreground dark:data-active:text-background"
                disabled={!!term}
              >
                <Icon className="size-4.5" />
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="mt-1 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {heading && (
          <p className="text-muted-foreground sticky top-0 bg-popover py-1.5 text-xs font-medium">
            {heading}
          </p>
        )}
        {visible.length === 0 ? (
          <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
            {t("chat.convPane.emoji.noResults")}
          </p>
        ) : (
          <div className={cn("grid grid-cols-8", term && "pt-1.5")}>
            {visible.map(([, emoji, label]) => (
              <button
                key={emoji}
                type="button"
                aria-label={label}
                title={label}
                onClick={() => onEmojiSelect(emoji)}
                className="hover:bg-accent focus-visible:ring-ring/50 flex size-9 items-center justify-center rounded-lg text-2xl leading-none outline-none focus-visible:ring-[3px]"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
