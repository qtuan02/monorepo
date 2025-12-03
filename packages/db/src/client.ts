import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

/**
 * Options for creating a Prisma Client instance
 */
export interface CreatePrismaClientOptions {
  /**
   * Database connection URL
   * Examples:
   * - MongoDB: mongodb://localhost:27017/mydb or mongodb+srv://user:pass@cluster.mongodb.net/mydb
   * - PostgreSQL: postgresql://user:pass@localhost:5432/mydb
   * - MySQL: mysql://user:pass@localhost:3306/mydb
   * - SQLite: file:./dev.db
   */
  url: string;
  /**
   * Logging configuration
   * @default ["error"]
   */
  log?: Prisma.LogLevel[];
}

/**
 * Global Prisma Client cache (singleton pattern)
 * Prevents multiple instances during hot reloading in development
 * and connection pool exhaustion in production
 *
 * Note: This implementation supports one database connection per application.
 * For multiple database connections, create separate instances with different variable names.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates a Prisma Client instance with the specified configuration.
 * Uses singleton pattern in development to prevent multiple instances.
 * In production, also uses singleton pattern to prevent connection pool exhaustion.
 *
 * @param options - Configuration options for Prisma Client
 * @returns PrismaClient instance
 *
 * @example
 * ```typescript
 * const prisma = createPrismaClient({
 *   url: process.env.DATABASE_URL!,
 *   log: ["query", "error", "warn"],
 * });
 * ```
 */
export function createPrismaClient(
  options: CreatePrismaClientOptions,
): PrismaClient {
  const { url, log = ["error"] } = options;

  // Validate URL
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    throw new Error("Database URL is required and must be a non-empty string");
  }

  // PrismaClient options with datasourceUrl (available from Prisma v5.2.0+)
  const clientOptions = {
    datasourceUrl: url,
    log,
  };

  // Use singleton pattern to prevent multiple connections
  // This is important in both development and production to avoid connection pool exhaustion
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient(
      clientOptions as ConstructorParameters<typeof PrismaClient>[0],
    );
  }

  return globalForPrisma.prisma;
}
