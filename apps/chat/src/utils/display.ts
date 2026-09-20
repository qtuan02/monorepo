interface DisplayNameSource {
  firstName: string;
  lastName: string;
  username: string;
}

/** Falls back to the username the moment both name parts are blank. */
export function getDisplayName(user: DisplayNameSource): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username
  );
}

/** First letter of the first and last word, upper-cased — "?" for a blank name. */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
