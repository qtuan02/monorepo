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
