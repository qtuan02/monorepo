import { describe, expect, it } from "vitest";

import dayjs from "../src/dayjs";
import { DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT } from "../src/formats";
import { defaultLocale } from "../src/locales";

describe("the configured singleton", () => {
  it("starts on the registry's default locale", () => {
    expect(dayjs.locale()).toBe(defaultLocale);
  });

  it("has `utc` extended", () => {
    expect(dayjs.utc("2024-03-05T08:09:07Z").format(TIME_FORMAT)).toBe("08:09");
  });

  it("has `timezone` extended after `utc`, so `.tz()` can shift an instant", () => {
    // `timezone` reads the offset helpers `utc` installs; extended in the wrong
    // order this throws instead of returning +07.
    const saigon = dayjs.utc("2024-03-05T00:30:00Z").tz("Asia/Ho_Chi_Minh");

    expect(saigon.format(DATE_TIME_FORMAT)).toBe("05/03/2024 07:30");
  });

  it("sets no default timezone, so a zone-less parse reads on the host's clock", () => {
    // The assertion goes through `dayjs.tz()` with no zone argument because that
    // is the one call `tz.setDefault()` would change: a plain `dayjs()` reads the
    // host clock whether a default is set or not, so it would pass either way and
    // guard nothing. `TZ=UTC` is pinned for the suite, so a `setDefault` sneaking
    // back into the singleton moves this offset to +07:00 (420 minutes).
    expect(dayjs.tz("2024-03-05T08:09:07").utcOffset()).toBe(0);
    expect(dayjs.tz("2024-03-05T08:09:07").format(TIME_FORMAT)).toBe("08:09");
  });

  it("has `customParseFormat` extended, so a day-first string is not read month-first", () => {
    const parsed = dayjs("05/03/2024", DATE_FORMAT, true);

    expect(parsed.isValid()).toBe(true);
    expect(parsed.format("YYYY-MM-DD")).toBe("2024-03-05");
  });

  it("has `relativeTime` extended", () => {
    const earlier = dayjs("2024-03-05T00:00:00Z").locale("en");
    const later = dayjs("2024-03-05T01:00:00Z");

    expect(earlier.from(later)).toBe("an hour ago");
  });
});
