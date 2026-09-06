// @vitest-environment node
//
// The node environment is required twice over: `ImageResponse` renders
// through wasm it reads from disk, and `~/env`'s server half throws by name
// under jsdom.
import { createTranslator } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { LanguageCode } from "@monorepo/i18n/languages";
import { languages, messages } from "@monorepo/i18n/languages";

import OpenGraphImage, {
  alt,
  contentType,
  size,
} from "~/app/[locale]/opengraph-image";

/**
 * `getTranslations` is next-intl's server entry, and outside a Next render it
 * has no request config to read — so it is replaced with the same translator
 * the real one builds, over the real catalogues. That keeps the seam honest:
 * the assertion below that the two locales render different pixels only means
 * something if each `t` reads its own locale's messages.
 */
const getTranslations = vi.hoisted(() =>
  vi.fn(async ({ locale }: { locale: LanguageCode }) =>
    createTranslator({ locale, messages: messages[locale] }),
  ),
);

vi.mock("next-intl/server", () => ({ getTranslations }));

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

async function renderPng(locale: string): Promise<Buffer> {
  const response = await OpenGraphImage({
    params: Promise.resolve({ locale }),
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("image/png");

  return Buffer.from(await response.arrayBuffer());
}

describe("opengraph-image", () => {
  it("declares the 1200×630 PNG card every unfurler expects", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    // The alt text is the candidate's name, read from the catalogue rather
    // than spelled a second time here.
    expect(alt).toBe(messages.vi.portfolio.meta.title);
  });

  it("renders a real PNG for every registered locale, from that locale's catalogue", async () => {
    const rendered = new Map<LanguageCode, Buffer>();

    for (const locale of languages) {
      const png = await renderPng(locale);

      expect(png.subarray(0, PNG_SIGNATURE.length)).toEqual(PNG_SIGNATURE);
      expect(getTranslations).toHaveBeenCalledWith({ locale });
      rendered.set(locale, png);
    }

    // The positioning line differs per locale, so the pixels must too. Equal
    // bytes would mean the string was hard-coded — or read from one locale
    // for both — and this is the only assertion that can tell.
    expect(rendered.get("vi")?.equals(rendered.get("en") as Buffer)).toBe(
      false,
    );
  }, 30_000);

  it("answers an unknown locale with a 404, like the layout does", async () => {
    await expect(
      OpenGraphImage({ params: Promise.resolve({ locale: "de" }) }),
    ).rejects.toMatchObject({ digest: expect.stringContaining("404") });
    expect(getTranslations).not.toHaveBeenCalledWith({ locale: "de" });
  });
});
