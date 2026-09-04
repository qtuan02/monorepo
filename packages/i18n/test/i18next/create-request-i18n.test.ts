import { beforeAll, describe, expect, it } from "vitest";

import { createI18n } from "../../src/i18next/create-i18n";
import { createRequestI18n } from "../../src/i18next/create-request-i18n";
import { messages } from "../../src/languages";

/**
 * `createRequestI18n` exists to keep a server render off the shared singleton,
 * so what these specs guard is not really "does `t()` work" — it is that one
 * request's language cannot reach another's. On a server the singleton is
 * shared by every in-flight render, and `changeLanguage` on it is a race with
 * no lock; the symptom is a page correctly rendered in someone else's
 * language, which no type and no lint rule can see.
 *
 * The seam is therefore the pair of assertions no ordinary translation test
 * makes: the singleton's language after a clone, and two clones alive at once.
 */

const SUMMARY_KEY = "header.notificationSummary";
const RETRY_KEY = "common.retry";

// The wiring site a Vite app owns in `~/libs/i18n.ts`; a spec is the other
// legitimate one. Inline resources make `init` synchronous, so nothing is
// awaited here.
const singleton = createI18n({ cookieName: "monorepo_lang" });

beforeAll(async () => {
  // Pin the singleton rather than inheriting whatever jsdom's `navigator`
  // detected, so "unchanged" below is an assertion about a known value.
  await singleton.changeLanguage("vi");
});

describe("the returned instance", () => {
  it("carries the requested language", () => {
    expect(createRequestI18n("en").language).toBe("en");
    expect(createRequestI18n("vi").language).toBe("vi");
  });

  it("translates without an await, as a server render needs", () => {
    // Pins the observable guarantee only. It does NOT pin `initAsync: false`:
    // the inline catalogue already forces i18next's synchronous branch, so a
    // clone made without the option translates identically today. See the
    // helper's doc comment for why the option is kept anyway.
    expect(createRequestI18n("en").t(RETRY_KEY)).toBe(messages.en.common.retry);
  });

  it("reads the shared ICU catalogue in its own language", () => {
    const en = createRequestI18n("en");
    const vi = createRequestI18n("vi");

    expect(en.t(RETRY_KEY)).toBe(messages.en.common.retry);
    expect(vi.t(RETRY_KEY)).toBe(messages.vi.common.retry);
  });

  it("applies the plural rules of its own language, not the singleton's", () => {
    const en = createRequestI18n("en");

    // English has `one` and `other`; Vietnamese has only `other`. Getting the
    // singular here proves the clone resolved the ICU message through `en`
    // rather than through the `vi` the singleton is sitting on.
    expect(en.t(SUMMARY_KEY, { name: "An", count: 1 })).toBe(
      "An: 1 new notification",
    );
    expect(en.t(SUMMARY_KEY, { name: "An", count: 5 })).toBe(
      "An: 5 new notifications",
    );
  });
});

describe("the singleton", () => {
  // The whole point of the helper. If cloning moved the singleton, every
  // concurrent render on the process would follow this request's language.
  it("keeps its language when a clone is made in another one", () => {
    expect(singleton.language).toBe("vi");

    createRequestI18n("en");

    expect(singleton.language).toBe("vi");
    expect(singleton.t(RETRY_KEY)).toBe(messages.vi.common.retry);
  });
});

describe("two concurrent requests", () => {
  it("each translate in their own language", () => {
    const vi = createRequestI18n("vi");
    const en = createRequestI18n("en");

    // Interleaved on purpose: reading them in creation order would still pass
    // if the later clone had clobbered the earlier one.
    expect(en.t(SUMMARY_KEY, { name: "An", count: 5 })).toBe(
      "An: 5 new notifications",
    );
    expect(vi.t(SUMMARY_KEY, { name: "An", count: 5 })).toBe(
      "An: 5 thông báo mới",
    );
    expect(en.language).toBe("en");
    expect(vi.language).toBe("vi");
    expect(singleton.language).toBe("vi");
  });
});
