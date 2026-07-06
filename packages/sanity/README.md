# @crudstack/sanity

> Sanity CMS database adapter for [Crudstack](../../README.md).

This package provides a `DatabaseAdapter` implementation for [Sanity.io](https://www.sanity.io/), allowing you to use Sanity as your database within the Crudstack ecosystem. It translates Crudstack's generic CRUD operations into Sanity's GROQ query language and handles the mapping between Sanity's internal document structure (`_id`, `_type`) and Crudstack's standard `Entity` interface (`id`).

## ✨ Features

- **🔌 Plug-and-Play**: Seamlessly integrates with `@crudstack/core`.
- **🔍 GROQ Translation**: Automatically converts type-safe `Query<T>` objects into optimized, parameterized GROQ queries.
- **🔄 Automatic Mapping**: Maps Sanity's `_id` to your standard `id` field automatically.
- **🛡️ Type-Safe**: Full TypeScript support for your Sanity document schemas.

## 📦 Installation

Install the core package, the Sanity adapter, and the official Sanity client:

```bash
pnpm add @crudstack/core @crudstack/sanity @sanity/client
```

## 🚀 Quick Start

### 1. Initialize the Sanity Client

Configure your official Sanity client. It is recommended to do this in a separate file to prevent multiple initializations during Next.js hot-reloads.

```ts
// lib/sanity.ts
import { createClient } from "@sanity/client";

export const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2023-05-03",
    useCdn: false, // Set to `true` if you don't need real-time consistency for reads
    token: process.env.SANITY_API_TOKEN, // Required for create, update, and delete operations
});
```

### 2. Initialize CrudStack

Pass the Sanity client into the `SanityAdapter` and initialize your `CrudStack` instance.

```ts
// lib/crudstack.ts
import { CrudStack } from "@crudstack/core";
import { SanityAdapter } from "@crudstack/sanity";
import { sanityClient } from "./sanity";

export const crudstack = new CrudStack({
    database: new SanityAdapter(sanityClient),
});
```

### 3. Define Types and Use the Resource Factory

The string name you pass to `createResource()` corresponds to the Sanity document `_type`.

```ts
// app/actions.ts
"use server";
import { crudstack } from "@/lib/crudstack";
import { revalidatePath } from "next/cache";

type User = { id: string; name: string; email: string; age: number | null };

// "user" maps to the Sanity document _type "user"
const users = crudstack.createResource<User>("user");

export async function createUser(data: Omit<User, "id">) {
    await users.create(data);
    revalidatePath("/dashboard/users");
}

export async function getUserByEmail(email: string) {
    // Automatically translates to GROQ: *[_type == "user" && email == "test@example.com"][0]
    return await users.getOne({ $eq: { email } });
}
```

## 📖 How it Works

### Document Mapping

Sanity documents require a `_type` field and use `_id` as the primary key.

- Create: When you call `users.create({ name: "John" })`, the adapter automatically injects `_type: "user"` (based on the resource name).
- Read: When Sanity returns a document, the adapter maps `_id` to `id` so your UI receives a clean `{ id: "...", name: "..." }` object.

### Query Translation

The adapter translates the generic `Query<T>` object into GROQ parameters securely.

```ts
// Crudstack Query
users.getList({ $eq: { age: 25, email: "test@test.com" } }) *
    // Generated GROQ
    [_type == $resource && age == $p0 && email == $p1];
// Params: { resource: "user", p0: 25, p1: "test@test.com" }
```

## 🤝 Contributing

Contributions are welcome! Please read the root [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on how to set up the monorepo and submit pull requests.
