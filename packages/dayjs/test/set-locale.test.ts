import { afterEach, describe, expect, it } from "vitest";

import dayjs from "../src/dayjs";
import { defaultLocale } from "../src/locales";
import { setDayjsLocale } from "../src/set-locale";

afterEach(() => {
  // The locale is global mutable state inside dayjs, so a test that leaves it
  // switched would leak into the next one.
  dayjs.locale(defaultLocale);
});

describe("setDayjsLocale", () => {
  it("switches to a code the registry carries", () => {
    setDayjsLocale("en");

    expect(dayjs.locale()).toBe("en");
  });

  it("matches on the language half, so a region code still resolves", () => {
    setDayjsLocale("en-US");

    expect(dayjs.locale()).toBe("en");
  });

  it("falls back to the default for a code the registry does not carry", () => {
    setDayjsLocale("en");
    setDayjsLocale("de");

    // `dayjs.locale("de")` alone would silently no-op and leave "en" in place,
    // which is the whole reason this wrapper exists.
    expect(dayjs.locale()).toBe(defaultLocale);
  });

  it("falls back for an empty code", () => {
    setDayjsLocale("en");
    setDayjsLocale("");

    expect(dayjs.locale()).toBe(defaultLocale);
  });
});
