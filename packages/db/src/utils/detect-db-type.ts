/**
 * Detects the database type from a connection URL
 *
 * @param url - Database connection URL
 * @returns Database type or null if unable to detect
 *
 * @example
 * ```typescript
 * const dbType = detectDatabaseType("mongodb://localhost:27017/mydb");
 * // Returns: "mongodb"
 * ```
 */
export function detectDatabaseType(
  url: string,
): "mongodb" | "postgresql" | "mysql" | "sqlite" | null {
  if (!url) return null;

  const lowerUrl = url.toLowerCase();

  if (
    lowerUrl.startsWith("mongodb://") ||
    lowerUrl.startsWith("mongodb+srv://")
  ) {
    return "mongodb";
  }

  if (
    lowerUrl.startsWith("postgresql://") ||
    lowerUrl.startsWith("postgres://")
  ) {
    return "postgresql";
  }

  if (lowerUrl.startsWith("mysql://") || lowerUrl.startsWith("mysql2://")) {
    return "mysql";
  }

  if (lowerUrl.startsWith("file:") || lowerUrl.startsWith("sqlite:")) {
    return "sqlite";
  }

  return null;
}
