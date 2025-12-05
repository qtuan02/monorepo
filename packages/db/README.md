# @monorepo/db

Database package with Prisma ORM and MongoDB support.

## Overview

This package provides a unified database interface using Prisma ORM with support for multiple database types (MongoDB, PostgreSQL, MySQL, SQLite). It includes connection management, type detection, and health check utilities.

## Features

- **Prisma ORM**: Type-safe database access
- **Multi-database Support**: MongoDB, PostgreSQL, MySQL, SQLite
- **Connection Management**: Singleton pattern for connection pooling
- **Health Checks**: Database connectivity monitoring
- **Type Detection**: Automatic database type detection from URL

## Usage

### Creating a Prisma Client

```typescript
import { createPrismaClient } from "@monorepo/db";

const prisma = createPrismaClient({
  url: process.env.DATABASE_URL!,
  log: ["error", "warn"],
});
```

### Database Operations

```typescript
// Query data
const users = await prisma.user.findMany();

// Create data
const user = await prisma.user.create({
  data: { name: "John", email: "john@example.com" },
});
```

### Connection Management

```typescript
import { checkConnection, connectDB, disconnectDB } from "@monorepo/db";

// Connect to database
await connectDB(prisma);

// Check connection status
const status = await checkConnection(prisma, process.env.DATABASE_URL);
if (status.connected) {
  console.log(`Connected to ${status.databaseType}`);
}

// Disconnect (useful for scripts)
await disconnectDB(prisma);
```

### Database Type Detection

```typescript
import { detectDatabaseType } from "@monorepo/db";

const dbType = detectDatabaseType(process.env.DATABASE_URL!);
// Returns: "mongodb" | "postgresql" | "mysql" | "sqlite" | null
```

## API Reference

### `createPrismaClient(options)`

Creates a Prisma Client instance with singleton pattern.

**Options:**

- `url` (string, required): Database connection URL
- `log` (Prisma.LogLevel[], optional): Logging configuration (default: `["error"]`)

**Returns:** `PrismaClient`

### `connectDB(prisma)`

Connects to the database.

**Parameters:**

- `prisma` (PrismaClient): Prisma Client instance

**Returns:** `Promise<void>`

### `disconnectDB(prisma)`

Disconnects from the database.

**Parameters:**

- `prisma` (PrismaClient): Prisma Client instance

**Returns:** `Promise<void>`

### `checkConnection(prisma, url?)`

Checks database connection status.

**Parameters:**

- `prisma` (PrismaClient): Prisma Client instance
- `url` (string, optional): Database URL for type detection

**Returns:** `Promise<ConnectionStatus>`

**ConnectionStatus:**

```typescript
interface ConnectionStatus {
  connected: boolean;
  error?: string;
  databaseType?: "mongodb" | "postgresql" | "mysql" | "sqlite";
}
```

### `detectDatabaseType(url)`

Detects database type from connection URL.

**Parameters:**

- `url` (string): Database connection URL

**Returns:** `"mongodb" | "postgresql" | "mysql" | "sqlite" | null`

## Database URLs

### MongoDB

```
mongodb://localhost:27017/mydb
mongodb+srv://user:pass@cluster.mongodb.net/mydb
```

### PostgreSQL

```
postgresql://user:pass@localhost:5432/mydb
postgres://user:pass@localhost:5432/mydb
```

### MySQL

```
mysql://user:pass@localhost:3306/mydb
mysql2://user:pass@localhost:3306/mydb
```

### SQLite

```
file:./dev.db
sqlite:./dev.db
```

## Prisma Schema

Define your schema in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  name  String
  email String @unique
}
```

## Scripts

- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push schema to database
- `pnpm db:migrate` - Run migrations
- `pnpm db:deploy` - Deploy migrations
- `pnpm db:studio` - Open Prisma Studio

## Dependencies

- `@prisma/client` - Prisma Client
- `prisma` - Prisma CLI
- `dotenv` - Environment variable loading

## Best Practices

1. **Singleton Pattern**: Always use `createPrismaClient` to prevent multiple connections
2. **Connection Pooling**: Let Prisma manage connection pooling
3. **Health Checks**: Use `checkConnection` for monitoring
4. **Type Safety**: Leverage Prisma's generated types
5. **Error Handling**: Always handle database errors appropriately

## Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB with Prisma](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Database Package Documentation](../../docs/packages/DATABASE.MD)
