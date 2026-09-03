import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import "dayjs/locale/en";
import "dayjs/locale/vi";

import { defaultLocale } from "./locales";

// `timezone` builds on the offset helpers `utc` installs — it must extend after it.
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

dayjs.locale(defaultLocale);

/**
 * The configured singleton — import this, never `dayjs` directly.
 *
 * There is deliberately no `tz.setDefault()`: timestamps render in the **device's**
 * own timezone, so the package stays reusable by any app rather than pinning one
 * facility's clock. Where a screen must show a fixed zone no matter where it is
 * read, pass it explicitly — `.tz("Asia/Ho_Chi_Minh")`.
 *
 * Extending at module scope, rather than exposing a `createDayjs()` the app must
 * remember to call first, removes the ordering hazard: ESM runs this file once
 * before any importer, so no module can observe an unextended dayjs and throw on
 * `.tz()`.
 */
export default dayjs;
