# Database Package

Package database tập trung sử dụng Prisma ORM 7, hỗ trợ nhiều loại database: MongoDB, PostgreSQL, MySQL, SQLite cho tất cả ứng dụng trong monorepo.

## Cài đặt

### 1. Thêm dependency

```json
{
  "dependencies": {
    "@monorepo/db": "workspace:*"
  }
}
```

### 2. Generate Prisma Client

```bash
pnpm --filter @monorepo/db db:generate
```

## Sử dụng

### Khởi tạo Prisma Client

Truyền database URL khi tạo client:

```typescript
import { createPrismaClient } from "@monorepo/db";

const prisma = createPrismaClient({
  url: process.env.DATABASE_URL!,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
```

**Lưu ý:** Package tự động sử dụng singleton pattern trong development để tránh tạo nhiều instance.

### Ví dụ sử dụng

```typescript
// Query
const users = await prisma.user.findMany();

// Create
const user = await prisma.user.create({
  data: { email: "user@example.com", name: "John" },
});

// Update
await prisma.user.update({
  where: { id: "user-id" },
  data: { name: "Jane" },
});

// Delete
await prisma.user.delete({ where: { id: "user-id" } });
```

### Quản lý kết nối

```typescript
import { createPrismaClient, connectDB, disconnectDB, checkConnection } from "@monorepo/db";

const prisma = createPrismaClient({ url: process.env.DATABASE_URL! });

// Kết nối
await connectDB(prisma);

// Kiểm tra kết nối (tự động detect database type từ URL)
const status = await checkConnection(prisma, process.env.DATABASE_URL);

// Ngắt kết nối (cho scripts/tests)
await disconnectDB(prisma);
```

### Singleton Pattern (Khuyến nghị)

Tạo một instance và tái sử dụng:

```typescript
// lib/db.ts
import { createPrismaClient } from "@monorepo/db";

export const prisma = createPrismaClient({
  url: process.env.DATABASE_URL!,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
```

## Prisma Commands

```bash
# Generate Prisma Client (sau khi thay đổi schema)
pnpm --filter @monorepo/db db:generate

# Push schema vào database (development)
pnpm --filter @monorepo/db db:push

# Mở Prisma Studio
pnpm --filter @monorepo/db db:studio

# Tạo migration
pnpm --filter @monorepo/db db:migrate

# Deploy migrations (production)
pnpm --filter @monorepo/db db:migrate:deploy
```

## Hỗ trợ nhiều Database

Package hỗ trợ các database sau:
- **MongoDB** - `mongodb://` hoặc `mongodb+srv://`
- **PostgreSQL** - `postgresql://` hoặc `postgres://`
- **MySQL** - `mysql://` hoặc `mysql2://`
- **SQLite** - `file:` hoặc `sqlite:`

### Cấu hình Provider trong Schema

Chỉnh sửa `packages/db/prisma/schema.prisma` để thay đổi database provider:

```prisma
datasource db {
  provider = "mongodb"  // Thay đổi thành: "postgresql", "mysql", hoặc "sqlite"
}
```

**Lưu ý:** Package tự động detect database type từ connection URL khi kiểm tra kết nối. Bạn chỉ cần đảm bảo provider trong schema khớp với database thực tế.

### Ví dụ cho các Database khác nhau

**MongoDB:**
```prisma
datasource db {
  provider = "mongodb"
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  @@map("users")
}
```

**PostgreSQL:**
```prisma
datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  @@map("users")
}
```

**MySQL:**
```prisma
datasource db {
  provider = "mysql"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  @@map("users")
}
```

**SQLite:**
```prisma
datasource db {
  provider = "sqlite"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  @@map("users")
}
```

## Quản lý Schema

Chỉnh sửa `packages/db/prisma/schema.prisma` để thêm/sửa models:

```prisma
model Post {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  createdAt DateTime @default(now())
  @@map("posts")
}
```

Sau khi thay đổi:
1. Chạy `pnpm --filter @monorepo/db db:generate`
2. Chạy `pnpm --filter @monorepo/db db:push` (hoặc tạo migration)

**Lưu ý về Field Types:**
- **MongoDB**: Dùng `@db.ObjectId`, `@map("_id")`, `@default(auto())`
- **PostgreSQL/MySQL**: Dùng `@default(uuid())`, `@default(cuid())`, hoặc `@default(autoincrement())`
- **SQLite**: Dùng `@default(autoincrement())` cho Int IDs

## Database Detection Utility

Package cung cấp utility để detect database type từ URL:

```typescript
import { detectDatabaseType } from "@monorepo/db";

const dbType = detectDatabaseType(process.env.DATABASE_URL!);
// Returns: "mongodb" | "postgresql" | "mysql" | "sqlite"
```

Function `checkConnection()` tự động detect database type và sử dụng phương thức kiểm tra phù hợp.

## Troubleshooting

| Lỗi | Giải pháp |
|-----|-----------|
| `Cannot find module '@prisma/client'` | Chạy `pnpm --filter @monorepo/db db:generate` |
| `P1001: Can't reach database server` | Kiểm tra database URL, database đang chạy, network/firewall |
| `P1012: Environment variable not found` | Đảm bảo truyền URL vào `createPrismaClient()` |
| Provider mismatch error | Đảm bảo provider trong schema khớp với database thực tế |
| TypeScript errors sau khi thay đổi schema | Chạy `db:generate` và restart TypeScript server |

## Tài liệu tham khảo

- [Prisma Docs](https://www.prisma.io/docs)
- [MongoDB with Prisma](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [PostgreSQL with Prisma](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [MySQL with Prisma](https://www.prisma.io/docs/concepts/database-connectors/mysql)
- [SQLite with Prisma](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
