import type { Db, MongoClientOptions } from "mongodb";
import { MongoClient } from "mongodb";

import { env } from "~/env";

if (!env.MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined");
}

const globalForMongo = globalThis as unknown as {
  client: MongoClient | undefined;
  db: Db | undefined;
};

/**
 * Extracts the database name from a MongoDB connection URL.
 * @param url - The MongoDB connection URL
 * @returns The database name, or "document" as default
 */
const getDatabaseName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const dbName = urlObj.pathname.slice(1); // Remove leading '/'
    return dbName || "document";
  } catch {
    return "document";
  }
};

const databaseName = getDatabaseName(env.MONGODB_URL);
const isProduction = env.NODE_ENV === "production";

/**
 * Creates MongoDB client options with appropriate TLS configuration.
 */
const createMongoOptions = (): MongoClientOptions => {
  const options: MongoClientOptions = {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
  };

  return options;
};

const mongoOptions = createMongoOptions();

export const client =
  globalForMongo.client ?? new MongoClient(env.MONGODB_URL, mongoOptions);

if (!isProduction) {
  globalForMongo.client = client;
}

// Connection is lazy - Better Auth will handle the connection when needed
export const db = globalForMongo.db ?? client.db(databaseName);

if (!isProduction) {
  globalForMongo.db = db;
}

/**
 * Checks the MongoDB connection status by attempting to connect and ping the database.
 * @returns Promise resolving to connection status with optional error and database name
 */
export async function checkMongoConnection(): Promise<{
  connected: boolean;
  error?: string;
  database?: string;
}> {
  try {
    // Try to connect and ping the database
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    return {
      connected: true,
      database: databaseName,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      database: databaseName,
    };
  }
}

// Log connection status on startup (only in development)
if (!isProduction && typeof process !== "undefined") {
  checkMongoConnection()
    .then((result) => {
      if (result.connected) {
        console.log("✅ MongoDB connected successfully");
        console.log(`📦 Database: ${result.database}`);
      } else {
        console.error("❌ MongoDB connection failed:");
        console.error(`   Error: ${result.error}`);
      }
    })
    .catch((error) => {
      console.error("❌ MongoDB connection check failed:", error);
    });
}
