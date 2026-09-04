import { describe, expect, it } from "vitest";

import dayjs from "../src/dayjs";
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  FULL_DATE_FORMAT,
  FULL_DATE_TIME_FORMAT,
  TIME_FORMAT,
  TIME_WITH_SECONDS_FORMAT,
  YEAR_FORMAT,
} from "../src/formats";

// A Tuesday, so the weekday token has something distinguishable to render.
// `TZ=UTC` is pinned in vitest.config.ts, which is what makes the wall-clock
// assertions below machine-independent (see testing-timezone).
const INSTANT = "2024-03-05T08:09:07Z";

describe("the format table", () => {
  it("renders the numeric formats day-first", () => {
    const instant = dayjs(INSTANT);

    expect(instant.format(DATE_FORMAT)).toBe("05/03/2024");
    expect(instant.format(YEAR_FORMAT)).toBe("2024");
    expect(instant.format(TIME_FORMAT)).toBe("08:09");
    expect(instant.format(TIME_WITH_SECONDS_FORMAT)).toBe("08:09:07");
    expect(instant.format(DATE_TIME_FORMAT)).toBe("05/03/2024 08:09");
  });

  it("renders the weekday formats in the instance's locale", () => {
    const english = dayjs(INSTANT).locale("en");

    expect(english.format(FULL_DATE_FORMAT)).toBe("Tuesday, 05/03/2024");
    expect(english.format(FULL_DATE_TIME_FORMAT)).toBe(
      "Tuesday, 05/03/2024 08:09:07",
    );
  });

  it("keeps the weekday formats locale-sensitive", () => {
    // The assertion is that the two differ, not what the Vietnamese copy says:
    // a `dddd` that ignored the locale would make these identical, which is the
    // failure this guards.
    const vietnamese = dayjs(INSTANT).locale("vi").format(FULL_DATE_FORMAT);
    const english = dayjs(INSTANT).locale("en").format(FULL_DATE_FORMAT);

    expect(vietnamese).not.toBe(english);
    expect(vietnamese.endsWith(", 05/03/2024")).toBe(true);
  });
});
