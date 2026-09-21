/**
 * Rebuilds `src/assets/emoji/emoji-data.json` from an extracted
 * `emojibase-data` package (https://www.npmjs.com/package/emojibase-data):
 *
 *   bun scripts/build-emoji-data.ts <path-to-emojibase-data>/en
 *
 * Kept pruned and committed rather than depended on at runtime: the full
 * `data.json` is ~775KB and carries skins, shortcodes and metadata the
 * picker never reads. One row per emoji — `[group, emoji, label, tags]` —
 * is what the picker's tabs and search need, ~1/5 the size, no CDN fetch.
 *
 * Dropped on purpose: skin-tone variants (the base emoji is kept), Emoji
 * versions newer than what shipping OS fonts render (tofu otherwise), the
 * "component" group (hair/skin modifiers, meaningless on their own) and
 * flags — Windows has no flag font, so every one renders as two letters.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface EmojibaseEmoji {
  emoji: string;
  label: string;
  group?: number;
  tags?: string[];
  version: number;
}

interface EmojibaseMessages {
  groups: { order: number; key: string }[];
}

const MAX_EMOJI_VERSION = 15;
const DROPPED_GROUP_KEYS = new Set(["component", "flags"]);

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error("Usage: bun scripts/build-emoji-data.ts <emojibase-data>/en");
  process.exit(1);
}

const data = JSON.parse(
  readFileSync(join(sourceDir, "data.json"), "utf8"),
) as EmojibaseEmoji[];
const messages = JSON.parse(
  readFileSync(join(sourceDir, "messages.json"), "utf8"),
) as EmojibaseMessages;

const groups = messages.groups
  .filter((group) => !DROPPED_GROUP_KEYS.has(group.key))
  .sort((a, b) => a.order - b.order);
const groupIndexByOrder = new Map(
  groups.map((group, index) => [group.order, index]),
);

const emoji = data
  .filter(
    (entry) =>
      entry.group !== undefined &&
      groupIndexByOrder.has(entry.group) &&
      entry.version <= MAX_EMOJI_VERSION,
  )
  .map((entry) => [
    groupIndexByOrder.get(entry.group as number),
    entry.emoji,
    entry.label,
    (entry.tags ?? []).join(" "),
  ]);

const outputPath = join(
  import.meta.dirname,
  "../src/assets/emoji/emoji-data.json",
);
writeFileSync(
  outputPath,
  `${JSON.stringify({ groups: groups.map((group) => group.key), emoji })}\n`,
);
console.log(`${emoji.length} emoji in ${groups.length} groups → ${outputPath}`);
