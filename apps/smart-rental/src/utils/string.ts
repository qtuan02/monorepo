/** "Nguyễn Văn An" → "NA"; a single word gives its first two letters. */
export function getInitials(value: string): string {
  const parts = value.split(" ").filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];

  if (parts.length >= 2 && first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
  return value.trim().slice(0, 2).toUpperCase();
}
