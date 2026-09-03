import { cleanup, render } from "@testing-library/react";
import { createTranslator } from "next-intl";
import { I18nextProvider, useTranslation } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";

import type { LanguageCode } from "../../src/languages";
import { createI18n } from "../../src/i18next/create-i18n";
import { languages, messages } from "../../src/languages";

/**
 * The executable half of ADR-0002: one ICU catalogue, two Flavors.
 *
 * A message carrying both an interpolation and a plural is rendered through the
 * i18next Flavor — really rendered, in jsdom, through `useTranslation` — and
 * through next-intl's core `createTranslator`, which needs no Next runtime. The
 * two have to produce the same string, or the catalogue is shared in name only
 * and the two Runtimes have quietly forked.
 *
 * The exact-string cases matter as much as the parity ones: parity alone would
 * still pass if both Flavors were wrong in the same way.
 */

const SUMMARY_KEY = "header.notificationSummary";
const VERSION_KEY = "footer.version";
const NAME = "An";
const COUNTS = [0, 1, 5];

// A Vite app calls this once from `~/libs/i18n.ts`; a spec is the other
// legitimate wiring site. Inline resources make `init` synchronous, so there is
// nothing to await here.
const i18n = createI18n({ cookieName: "monorepo_lang" });

type NotificationSummaryProps = { count: number; name: string };

function NotificationSummary({ count, name }: NotificationSummaryProps) {
  const { t } = useTranslation();
  return <span>{t(SUMMARY_KEY, { count, name })}</span>;
}

function AppVersion({ version }: { version: string }) {
  const { t } = useTranslation();
  return <span>{t(VERSION_KEY, { version })}</span>;
}

function renderSummary(count: number, name: string) {
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <NotificationSummary count={count} name={name} />
    </I18nextProvider>,
  );

  return container.textContent;
}

function renderVersion(version: string) {
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <AppVersion version={version} />
    </I18nextProvider>,
  );

  return container.textContent;
}

function translateSummary(locale: LanguageCode, count: number, name: string) {
  const t = createTranslator({
    locale,
    messages: messages[locale],
    timeZone: "UTC",
  });

  return t(SUMMARY_KEY, { count, name });
}

function translateVersion(locale: LanguageCode, version: string) {
  const t = createTranslator({
    locale,
    messages: messages[locale],
    timeZone: "UTC",
  });

  return t(VERSION_KEY, { version });
}

afterEach(() => {
  cleanup();
});

describe("one ICU catalogue, two Flavors", () => {
  for (const locale of languages) {
    for (const count of COUNTS) {
      it(`plural parity in ${locale}, count ${count}`, async () => {
        await i18n.changeLanguage(locale);
        expect(i18n.resolvedLanguage).toBe(locale);

        const rendered = renderSummary(count, NAME);

        expect(rendered).toBe(translateSummary(locale, count, NAME));
        // An unresolved key comes back as the key itself, which would satisfy
        // the parity assertion on both sides.
        expect(rendered).not.toBe(SUMMARY_KEY);
      });
    }

    it(`interpolation parity in ${locale}`, async () => {
      await i18n.changeLanguage(locale);

      const rendered = renderVersion("1.0.0");

      expect(rendered).toBe(translateVersion(locale, "1.0.0"));
      expect(rendered).toContain("1.0.0");
    });
  }

  it("picks Vietnamese's single plural category", async () => {
    await i18n.changeLanguage("vi");

    expect(renderSummary(1, NAME)).toBe("An: 1 thông báo mới");
    expect(renderSummary(5, NAME)).toBe("An: 5 thông báo mới");
    expect(translateSummary("vi", 1, NAME)).toBe("An: 1 thông báo mới");
    expect(translateSummary("vi", 5, NAME)).toBe("An: 5 thông báo mới");
  });

  it("picks the `one` and `other` English plural categories", async () => {
    await i18n.changeLanguage("en");

    expect(renderSummary(1, NAME)).toBe("An: 1 new notification");
    expect(renderSummary(5, NAME)).toBe("An: 5 new notifications");
    expect(translateSummary("en", 1, NAME)).toBe("An: 1 new notification");
    expect(translateSummary("en", 5, NAME)).toBe("An: 5 new notifications");
  });

  it("reads ICU single braces, not i18next double braces", async () => {
    await i18n.changeLanguage("vi");

    expect(renderVersion("1.0.0")).toBe("Phiên bản 1.0.0");
    expect(translateVersion("vi", "1.0.0")).toBe("Phiên bản 1.0.0");
  });
});
