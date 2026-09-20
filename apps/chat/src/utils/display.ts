interface DisplayNameSource {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}

/**
 * Falls back to the username the moment both name parts are blank, and to
 * `""` once the username is missing too — a real backend record can carry
 * none of the three, and `""` (unlike `undefined`) is a safe input to
 * `getInitials`.
 */
export function getDisplayName(user: DisplayNameSource): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    ""
  );
}

/** First letter of the first and last word, upper-cased — "?" for a blank or missing name. */
export function getInitials(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
