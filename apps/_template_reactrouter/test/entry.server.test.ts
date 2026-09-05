import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * `entry.server.tsx` is read as TEXT rather than imported, the same seam
 * `_template_next`'s `proxy.test.ts` uses on its matcher literal: importing it
 * would need a whole `EntryContext` to call, and what has to hold here is not
 * the output of one call but a property of the file.
 *
 * The property: nothing on a server request path may call `changeLanguage`. The
 * i18next singleton is shared by every render the Node process is doing at once,
 * so that write is a race with no lock, and its symptom — a page served in
 * another visitor's language — is invisible under any load a developer produces
 * by hand and reproduces on no machine. There is no runtime assertion that
 * catches it, so this is the one that can.
 */
// `process.cwd()` is the app root — Vitest sets it from this project's config.
// `import.meta.url` is not usable here: under the jsdom environment it is not a
// `file:` URL, so `fileURLToPath` throws.
const source = readFileSync(
  resolve(process.cwd(), "src/entry.server.tsx"),
  "utf8",
);

describe("entry.server", () => {
  it("renders through a per-request i18next instance", () => {
    expect(source).toContain("createRequestI18n(");
    expect(source).toContain("<I18nextProvider i18n={requestI18n}>");
  });

  it("never moves the shared singleton's language", () => {
    expect(source).not.toContain("changeLanguage");
  });

  it("takes the language from the context root's middleware wrote", () => {
    // Not a second `resolveLanguage(request, …)` call here: one decision per
    // request, made in `root.tsx`, is what keeps `meta`, the loader payload and
    // the rendered tree from ever disagreeing.
    expect(source).toContain("loadContext.get(languageContext)");
    expect(source).not.toContain("resolveLanguage");
  });
});
