import type { PrismaClient } from "@prisma/client";

import { detectDatabaseType } from "./detect-db-type";

/**
 * Connects to the database
 *
 * @param prisma - Prisma Client instance
 *
 * @example
 * ```typescript
 * await connectDB(prisma);
 * ```
 */
export async function connectDB(prisma: PrismaClient): Promise<void> {
  await prisma.$connect();
}

/**
 * Disconnects from the database
 * Useful for scripts and tests
 *
 * @param prisma - Prisma Client instance
 *
 * @example
 * ```typescript
 * await disconnectDB(prisma);
 * ```
 */
export async function disconnectDB(prisma: PrismaClient): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Connection status result
 */
export interface ConnectionStatus {
  connected: boolean;
  error?: string;
  databaseType?: "mongodb" | "postgresql" | "mysql" | "sqlite";
}

/**
 * Checks the database connection status
 * Automatically detects database type from URL and uses appropriate check method
 *
 * @param prisma - Prisma Client instance
 * @param url - Database connection URL (optional, for database type detection)
 * @returns Connection status
 *
 * @example
 * ```typescript
 * const status = await checkConnection(prisma, process.env.DATABASE_URL);
 * if (status.connected) {
 *   console.log(`Connected to ${status.databaseType}`);
 * }
 * ```
 */
export async function checkConnection(
  prisma: PrismaClient,
  url?: string,
): Promise<ConnectionStatus> {
  try {
    // Detect database type from URL if provided
    const dbType = url ? detectDatabaseType(url) : null;

    // For MongoDB, use $runCommandRaw with ping command
    if (dbType === "mongodb") {
      // MongoDB uses $runCommandRaw for native commands
      await prisma.$runCommandRaw({ ping: 1 });
    } else if (
      dbType === "postgresql" ||
      dbType === "mysql" ||
      dbType === "sqlite"
    ) {
      // For SQL databases (PostgreSQL, MySQL, SQLite), use a simple query
      // Use type assertion since PrismaClient type varies by database provider
      const sqlClient = prisma as PrismaClient & {
        $queryRaw: (query: TemplateStringsArray) => Promise<unknown[]>;
      };
      await sqlClient.$queryRaw`SELECT 1`;
    } else {
      // Unknown database type or no URL provided
      // Try MongoDB first, then SQL as fallback
      try {
        await prisma.$runCommandRaw({ ping: 1 });
      } catch {
        // If MongoDB command fails, try SQL query
        const sqlClient = prisma as PrismaClient & {
          $queryRaw: (query: TemplateStringsArray) => Promise<unknown[]>;
        };
        await sqlClient.$queryRaw`SELECT 1`;
      }
    }

    return {
      connected: true,
      databaseType: dbType || undefined,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
      databaseType: url ? detectDatabaseType(url) || undefined : undefined,
    };
  }
}
