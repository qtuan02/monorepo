import en from "./locales/en.json";
import vi from "./locales/vi.json";

/**
 * The language registry — the single place a language is added workspace-wide.
 *
 * Adding a code here gives every Runtime detection, fallback and a switcher
 * entry. It also breaks the `messages` map below until the matching JSON
 * exists, so the compiler names the file still to write.
 */
export const languages = ["vi", "en"] as const;

export type LanguageCode = (typeof languages)[number];

export const defaultLanguage: LanguageCode = "vi";

/**
 * The shape every locale file has to satisfy. Anchored on `vi.json` because it
 * is the default language and therefore the catalogue that is always complete;
 * a key missing from another locale is a typecheck error rather than a message
 * silently resolved from the fallback bundle.
 */
export type LocaleMessages = typeof vi;

/**
 * One catalogue per language, imported statically so every Flavor reads the
 * same object and a bundler can see it. Typed against the registry on purpose:
 * adding a code to `languages` breaks this map until its JSON exists.
 */
export const messages: Record<LanguageCode, LocaleMessages> = { vi, en };

/** Narrows an unknown value — a URL segment, a cookie — onto the registry. */
export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && languages.some((code) => code === value);
}
