import dayjs from "@monorepo/dayjs";
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
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
