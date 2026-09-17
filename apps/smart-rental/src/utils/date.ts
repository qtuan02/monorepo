import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

export function formatDate(input: Date | number | string): string {
  return dayjs(input).format(DATE_FORMAT);
}
