import type { Db } from "mongodb";
import { MongoClient } from "mongodb";

import { env } from "~/env";

if (!env.MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined");
}

const globalForMongo = globalThis as unknown as {
  client: MongoClient | undefined;
  db: Db | undefined;
};

// Extract database name from URL or use default
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

// Check if we're in production mode
const isProduction = env.NODE_ENV === "production";

// Check if it's MongoDB Atlas (mongodb+srv://)
const isAtlas = env.MONGODB_URL.startsWith("mongodb+srv://");

// MongoDB client options
const mongoOptions: {
  maxPoolSize: number;
  minPoolSize: number;
  serverSelectionTimeoutMS: number;
  tls?: boolean;
  tlsAllowInvalidCertificates?: boolean;
  tlsAllowInvalidHostnames?: boolean;
  retryWrites?: boolean;
} = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
};

// For MongoDB Atlas, configure TLS properly
if (isAtlas) {
  // MongoDB Atlas requires TLS
  mongoOptions.tls = true;
  // In development, allow invalid certificates to bypass SSL issues
  // Remove this in production for security
  if (!isProduction) {
    mongoOptions.tlsAllowInvalidCertificates = true;
    mongoOptions.tlsAllowInvalidHostnames = true;
  }
}

export const client =
  globalForMongo.client ?? new MongoClient(env.MONGODB_URL, mongoOptions);

if (!isProduction) {
  globalForMongo.client = client;
}

// Connect to MongoDB - connection is lazy, so we don't need to await here
// Better Auth will handle the connection when needed

export const db = globalForMongo.db ?? client.db(databaseName);

if (!isProduction) {
  globalForMongo.db = db;
}

// Function to check MongoDB connection
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
