// Main exports
export { createPrismaClient } from "./client";
export type { CreatePrismaClientOptions } from "./client";

// Utility exports
export { detectDatabaseType } from "./utils/detect-db-type";
export { connectDB, disconnectDB, checkConnection } from "./utils/connection";
export type { ConnectionStatus } from "./utils/connection";

// Re-export Prisma types for convenience
export type { Prisma, PrismaClient } from "@prisma/client";
