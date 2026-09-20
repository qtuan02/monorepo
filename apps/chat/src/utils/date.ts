import dayjs from "@monorepo/dayjs";
import {
  DATE_FORMAT,
  DAY_MONTH_FORMAT,
  TIME_FORMAT,
  WEEKDAY_FORMAT,
} from "@monorepo/dayjs/formats";
import { defaultLanguage } from "@monorepo/i18n/languages";

import i18n from "~/libs/i18n";

/**
 * The one timezone contract with `chat-socket`: every timestamp it sends is
 * UTC (with or without a `Z` suffix — `dayjs.utc` reads both as UTC), and
 * every timestamp the FE renders is the viewer's local clock. Nothing outside
 * this file calls `dayjs(value)` on a BE string (see
 * .agents/rules/dates-dayjs-singleton.md).
 */
function toLocal(value: string, language: string) {
  return dayjs.utc(value).local().locale(language);
}

/** The other half of the contract: a timestamp handed to `chat-socket` is UTC ISO (`…Z`), never the viewer's local time. */
export function toApiTimestamp(value: Date | string | number): string {
  return dayjs(value).utc().toISOString();
}

/** A bare date — a profile's "joined" line. */
export function formatDate(value: string): string {
  return toLocal(value, defaultLanguage).format(DATE_FORMAT);
}

/**
 * A conversation row's own timestamp: today's time, "Yesterday", a weekday
 * within the last week, else a bare date. `dddd` and the "Yesterday" text
 * are locale-sensitive, so — like `formatMessageDateLabel` — this takes the
 * caller's resolved language rather than reading dayjs's global locale,
 * which the React Compiler cannot see change (see
 * .agents/rules/dates-locale-render-input.md). Pass
 * `i18n.resolvedLanguage ?? defaultLanguage` from the calling component's
 * own `useTranslation()`.
 */
export function formatConversationTimestamp(
  value: string,
  language: string = defaultLanguage,
): string {
  const date = toLocal(value, language);
  const now = dayjs().locale(language);

  if (date.isSame(now, "day")) return date.format(TIME_FORMAT);
  if (date.isSame(now.subtract(1, "day"), "day")) {
    return i18n.t("chat.date.yesterday", { lng: language });
  }
  if (date.isSame(now, "week")) return date.format(WEEKDAY_FORMAT);
  return date.format(DATE_FORMAT);
}

/** The centered divider label a run of messages groups under — Today / Yesterday / a weekday this week / a date (spec #232 story 30). See `formatConversationTimestamp` for why `language` is a parameter. */
export function formatMessageDateLabel(
  value: string,
  language: string = defaultLanguage,
): string {
  const date = toLocal(value, language);
  const now = dayjs().locale(language);

  if (date.isSame(now, "day"))
    return i18n.t("chat.date.today", { lng: language });
  if (date.isSame(now.subtract(1, "day"), "day")) {
    return i18n.t("chat.date.yesterday", { lng: language });
  }
  if (date.isSame(now, "week")) return date.format(WEEKDAY_FORMAT);
  if (date.isSame(now, "year")) return date.format(DAY_MONTH_FORMAT);
  return date.format(DATE_FORMAT);
}

/** A bubble's own footer timestamp. */
export function formatMessageTime(value: string): string {
  return toLocal(value, defaultLanguage).format(TIME_FORMAT);
}

/** Whether two ISO timestamps fall on the same calendar day, in the viewer's local time. Locale-independent — day boundaries don't move with the active language. */
export function isSameDay(a: string, b: string): boolean {
  return toLocal(a, defaultLanguage).isSame(toLocal(b, defaultLanguage), "day");
}

/** Elapsed whole minutes between two ISO timestamps, order-independent. */
export function minutesBetween(a: string, b: string): number {
  return Math.abs(dayjs(a).diff(dayjs(b), "minute"));
}
