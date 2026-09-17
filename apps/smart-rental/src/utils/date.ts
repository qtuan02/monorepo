import dayjs from "@monorepo/dayjs";
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  FULL_DATE_FORMAT,
  MONTH_FORMAT,
} from "@monorepo/dayjs/formats";

export function formatDate(input: Date | number | string): string {
  return dayjs(input).format(DATE_FORMAT);
}

export function formatDateTime(input: Date | number | string): string {
  return dayjs(input).format(DATE_TIME_FORMAT);
}

/** A `YYYY-MM` period (the Mock, an `<input type="month">`) read as `MM/YYYY`. */
export function formatMonth(input: string): string {
  return dayjs(input).format(MONTH_FORMAT);
}

/**
 * "Thứ Năm, 17/09/2026" — the "Hôm nay" screen's own heading (spec #153
 * §10). dayjs's `vi` locale spells `dddd` lowercase ("thứ năm"); this app
 * sets that locale once at boot and never switches it (no i18n, ADR-0011),
 * so there is no re-render where the global default could go stale under
 * the React Compiler (contrast `dates-locale-render-input.md`, which is
 * about an app that switches languages at runtime).
 */
export function formatFullDate(
  input: Date | number | string = new Date(),
): string {
  const text = dayjs(input).format(FULL_DATE_FORMAT);
  return text.charAt(0).toUpperCase() + text.slice(1);
}
