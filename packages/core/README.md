# @crudstack/core

> The core engine and type-safe interfaces for [Crudstack](../../README.md).

This package contains the foundational interfaces, the `DatabaseAdapter` contract, and the `CrudStack` class that powers the entire Crudstack ecosystem. It is completely database-agnostic and relies on adapter packages (like `@crudstack/sanity` or `@crudstack/sqlite`) to perform the actual database operations.

## 📦 Installation

```bash
pnpm add @crudstack/core
```

## 🚀 Usage

### 1. Initialize with an Adapter

Import CrudStack and pass it an adapter that implements the `DatabaseAdapter` interface.

```ts
import { CrudStack } from "@crudstack/core";
import { SanityAdapter } from "@crudstack/sanity";
import { sanityClient } from "./sanity";

const crudstack = new CrudStack({
    database: new SanityAdapter(sanityClient),
});
```

### 2. Create Type-Safe Resources

Use the factory method to create a resource. The generic type `<T>` ensures that all CRUD operations and queries are strictly type-checked against your entity definition.

```ts
type User = { id: string; name: string; email: string };

// The string "user" is passed to the adapter (e.g., as the Sanity _type or SQL table name)
const users = crudstack.createResource<User>("user");

// Create
const newUser = await users.create({ name: "Alice", email: "alice@example.com" });

// Read (Type-safe querying)
const alice = await users.getOne({ $eq: { email: "alice@example.com" } });

// Update
await users.update(newUser.id, { name: "Alice Smith" });

// Delete
await users.delete(newUser.id);
```

## 🧩 Core Concepts

`Entity`

All entities must extend the base `Entity` type, which requires an `id` string.

```ts
export type Entity = { id: string };
```

`Query<T>`

Queries are strictly typed. If a field does not exist on your Entity, TypeScript will prevent you from querying it.
ts

```ts
export type Query<T extends Entity> = {
    $eq?: Partial<T>;
    // Future operators: $gt, $lt, $in, etc.
};
```

`DatabaseAdapter`

The contract that all database providers must implement. It takes the `resource` name (e.g., table name or document type) and an optional `schema` object.

```ts
export interface DatabaseAdapter {
    getOne<T extends Entity>(resource: string, query: Query<T>, schema?: unknown): Promise<T>;
    getList<T extends Entity>(resource: string, query?: Query<T>, schema?: unknown): Promise<T[]>;
    create<T extends Entity>(resource: string, data: Omit<T, "id">, schema?: unknown): Promise<T>;
    update<T extends Entity>(
        resource: string,
        id: string,
        data: Partial<Omit<T, "id">>,
        schema?: unknown,
    ): Promise<T>;
    delete(resource: string, id: string, schema?: unknown): Promise<void>;
}
```

## 🤝 Contributing

Please read the root [CONTRIBUTING.md](../../CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.
