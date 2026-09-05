import type { LanguageCode } from "./languages";
import { defaultLanguage, isLanguageCode } from "./languages";

/**
 * Resolves the language of one incoming request: the cookie the visitor's last
 * choice was written to, then what their browser asked for, then the default.
 *
 * It lives outside every Flavor because it depends on the registry and nothing
 * else — no i18next, no next-intl, no DOM, no Node API — so a server bundle can
 * import it whatever renders the page. Both Flavors already agree on this
 * order: the i18next detector runs `["cookie", "navigator"]`, and next-intl's
 * proxy reads its locale cookie before negotiating the header. This is that
 * same rule for a Runtime that has neither — a server render, where the request
 * is the only thing there is to detect from.
 *
 * Every step narrows through `isLanguageCode`, so an unregistered code is never
 * indexed into `messages` and never reaches a translator.
 */
export function resolveLanguage(
  request: Request,
  cookieName: string,
): LanguageCode {
  const chosen = readLanguageCookie(request.headers.get("cookie"), cookieName);

  if (chosen) {
    return chosen;
  }

  for (const candidate of parseAcceptLanguage(
    request.headers.get("accept-language"),
  )) {
    if (isLanguageCode(candidate)) {
      return candidate;
    }
  }

  return defaultLanguage;
}

/**
 * The stored language choice, or `undefined` when there is none or it names a
 * language the registry does not have. Exported on its own because it reads a
 * `document.cookie` string as well as a `Cookie` header — both are
 * `name=value; name=value` — and a client entry needs exactly this half of
 * `resolveLanguage`: what the visitor chose, with no header fallback.
 */
export function readLanguageCookie(
  cookies: string | null,
  cookieName: string,
): LanguageCode | undefined {
  const chosen = readCookie(cookies, cookieName);

  return isLanguageCode(chosen) ? chosen : undefined;
}

/**
 * Reads one cookie out of a `Cookie` header, normalized the same way a header
 * range is. Split on the FIRST `=` only: a cookie value may legally contain
 * more of them, and taking `split("=")[1]` would truncate it at the second.
 *
 * The normalization is not decoration. Today both writers of this cookie — the
 * i18next detector's `caches: ["cookie"]` and next-intl's routing cookie —
 * store a bare lowercase registry code, so matching verbatim would work. But a
 * value that arrives as `EN` or `en-US` is the same stored choice, and handing
 * it to `isLanguageCode` raw would silently discard it and fall through to the
 * browser's header — the visitor's explicit choice losing to their default.
 */
function readCookie(header: string | null, name: string): string | undefined {
  if (!header) {
    return undefined;
  }

  for (const pair of header.split(";")) {
    const separator = pair.indexOf("=");

    if (separator === -1 || pair.slice(0, separator).trim() !== name) {
      continue;
    }

    try {
      return languageOnly(
        decodeURIComponent(pair.slice(separator + 1).trim()).toLowerCase(),
      );
    } catch {
      // A lone `%` makes `decodeURIComponent` throw. The header is attacker
      // controlled, so a malformed value has to read as "no cookie" rather
      // than as a URIError out of every server render.
      return undefined;
    }
  }

  return undefined;
}

interface LanguageRange {
  /** The tag with its region stripped — already a registry candidate. */
  language: string;
  quality: number;
}

/**
 * Orders an `Accept-Language` header into the candidates to try, most preferred
 * first.
 */
function parseAcceptLanguage(header: string | null): string[] {
  if (!header) {
    return [];
  }

  return (
    header
      .split(",")
      .map(parseLanguageRange)
      // RFC 9110 spells "not acceptable" as `q=0`, which names a language the
      // client explicitly refused — dropping it is not the same as ranking it
      // last.
      .filter((range) => range.quality > 0)
      // `Array.prototype.sort` is required to be stable, and that is the whole
      // reason no source index is carried through here: ranges of equal `q` come
      // out in the order the header listed them.
      .sort((a, b) => b.quality - a.quality)
      .map((range) => range.language)
  );
}

function parseLanguageRange(part: string): LanguageRange {
  const [tag = "", ...parameters] = part.split(";");

  return {
    // i18next's `load: "languageOnly"`, applied to the header instead of to a
    // detected value: `en-US` is a request for `en`, and the registry only
    // ever holds the bare code.
    language: languageOnly(tag.trim().toLowerCase()),
    quality: readQuality(parameters),
  };
}

function languageOnly(tag: string): string {
  const separator = tag.indexOf("-");

  return separator === -1 ? tag : tag.slice(0, separator);
}

function readQuality(parameters: string[]): number {
  for (const parameter of parameters) {
    const [name = "", value = ""] = parameter.split("=");

    if (name.trim().toLowerCase() !== "q") {
      continue;
    }

    const quality = Number.parseFloat(value.trim());

    // A `q` we cannot read is dropped rather than promoted: a range whose
    // weight is unparseable must not outrank one that states a real number.
    return Number.isNaN(quality) ? 0 : quality;
  }

  // A range with no `q` at all is the most preferred one, per RFC 9110.
  return 1;
}
