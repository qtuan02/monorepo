import dayjs from "@monorepo/dayjs";
import {
  DATE_FORMAT,
  DAY_MONTH_FORMAT,
  TIME_FORMAT,
  WEEKDAY_FORMAT,
} from "@monorepo/dayjs/formats";

/**
 * `chat-socket` sends timestamps with no timezone suffix — `dayjs.utc` reads
 * them as UTC directly, then `.local()` renders on the viewer's own clock (see
 * .agents/rules/dates-dayjs-singleton.md).
 */
function toLocal(value: string) {
  return dayjs.utc(value).local();
}

/** A conversation row's own timestamp: today's time, "Yesterday", a weekday within the last week, else a bare date. */
export function formatConversationTimestamp(value: string): string {
  const date = toLocal(value);
  const now = dayjs();

  if (date.isSame(now, "day")) return date.format(TIME_FORMAT);
  if (date.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
  if (date.isSame(now, "week")) return date.format(WEEKDAY_FORMAT);
  return date.format(DATE_FORMAT);
}

/** The centered divider label a run of messages groups under. */
export function formatMessageDateLabel(value: string): string {
  const date = toLocal(value);
  const now = dayjs();

  if (date.isSame(now, "day")) return "Today";
  if (date.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
  if (date.isSame(now, "year")) return date.format(DAY_MONTH_FORMAT);
  return date.format(DATE_FORMAT);
}

/** A bubble's own footer timestamp. */
export function formatMessageTime(value: string): string {
  return toLocal(value).format(TIME_FORMAT);
}

/** Whether two ISO timestamps fall on the same calendar day, in the viewer's local time. */
export function isSameDay(a: string, b: string): boolean {
  return toLocal(a).isSame(toLocal(b), "day");
}

/** Elapsed whole minutes between two ISO timestamps, order-independent. */
export function minutesBetween(a: string, b: string): number {
  return Math.abs(dayjs(a).diff(dayjs(b), "minute"));
}
