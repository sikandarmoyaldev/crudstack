# @crudstack/sqlite

> SQLite database adapter for [Crudstack](../../README.md) powered by [Drizzle ORM](https://orm.drizzle.team/).

This package provides a `DatabaseAdapter` implementation for SQLite, allowing you to use local or server-side SQLite databases within the Crudstack ecosystem. It leverages `drizzle-orm` and `better-sqlite3` to translate Crudstack's generic CRUD operations into highly optimized SQL queries.

## Features

- **Plug-and-Play**: Seamlessly integrates with `@crudstack/core`.
- **High Performance**: Powered by `better-sqlite3` for synchronous, fast SQLite operations.
- **Type-Safe**: Leverages Drizzle ORM's type inference for fully type-safe queries and schema definitions.
- **Schema-Driven**: Uses your Drizzle table definitions to dynamically map queries to SQL columns.

## Installation

Install the core package, the SQLite adapter, and the required database dependencies:

```bash
pnpm add @crudstack/core @crudstack/sqlite drizzle-orm better-sqlite3
```

## Quick Start

### 1. Define your Drizzle Schema

First, define your SQLite tables using Drizzle ORM. Note that your tables must include an `id` column, as the adapter uses it for `update` and `delete` operations.

```ts
// db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";

export const users = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    age: integer("age"),
});
```

### 2. Initialize Drizzle and CrudStack

Create your SQLite database connection using `better-sqlite3` and `drizzle`, then pass it to the `SQLiteAdapter`.

```ts
// lib/crudstack.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { CrudStack } from "@crudstack/core";
import { SQLiteAdapter } from "@crudstack/sqlite";

// 1. Initialize the SQLite database
const sqlite = new Database("sqlite.db"); // Use ":memory:" for in-memory testing
const db = drizzle(sqlite);

// 2. Initialize the SQLite Adapter
const sqliteAdapter = new SQLiteAdapter(db);

// 3. Initialize CrudStack
export const crudstack = new CrudStack({
    database: sqliteAdapter,
});
```

### 3. Create Resources and Perform CRUD

When creating a resource, you must pass your Drizzle table schema as the second argument. This allows the adapter to know which columns exist and how to build SQL queries.

```ts
// app/actions.ts
"use server";
import { crudstack } from "@/lib/crudstack";
import { users } from "@/db/schema";
import { revalidatePath } from "next/cache";

type User = { id: string; name: string; email: string; age: number | null };

// Pass the Drizzle schema as the second argument
const userService = crudstack.createResource<User>("users", users);

export async function createUser(data: Omit<User, "id">) {
    await userService.create(data);
    revalidatePath("/dashboard/users");
}

export async function getUsers() {
    return await userService.getList();
}

export async function getUsersByAge() {
    // Translates to: SELECT * FROM users WHERE age = 18
    return await userService.getList({ $eq: { age: 18 } });
}
```

## 📖 How it Works

### Schema Mapping

Unlike document databases, SQL requires strict table definitions. The `SQLiteAdapter` relies on the schema parameter passed via `createResource(name, schema)`.

- **Query Translation**: When you query `{ $eq: { email: "test@test.com" } }`, the adapter looks up the `email` key in your Drizzle `users` table schema and generates the correct `WHERE email = ?` SQL clause.
- **ID Resolution**: For `update` and delete operations, the adapter automatically looks for the id column in your schema to construct the `WHERE id = ?` clause.

### Supported Query Operators

Currently, the adapter supports the `$eq` operator from the core `Query<T>` interface.

```ts
// Fetches all users named "Sikandar"
userService.getList({ $eq: { name: "Sikandar" } });
```

## 🤝 Contributing

Contributions are welcome! Please read the root [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on how to set up the monorepo and submit pull requests.
