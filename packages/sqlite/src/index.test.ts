import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

import { SQLiteDatabaseAdapter, queryBuilder } from "./index";

const users = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    age: integer("age"),
});

type User = { id: string; name: string; email: string; age: number | null };

describe("SQLiteDatabaseAdapter + QueryBuilder", () => {
    let adapter: SQLiteDatabaseAdapter;
    let sqliteDb: Database.Database;

    // This runs before EVERY test, ensuring a completely clean database state
    beforeEach(() => {
        // Create an in-memory SQLite database
        sqliteDb = new Database(":memory:");

        // Create the table manually (since we aren't running migrations in tests)
        sqliteDb.exec(`
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                age INTEGER
            );
        `);

        // Initialize Drizzle and the Adapter
        const db = drizzle(sqliteDb);
        adapter = new SQLiteDatabaseAdapter(db);
    });

    it("should create and get a record using the QueryBuilder", async () => {
        const data = { name: "Sikandar", email: "sikandar@test.com", age: 25 };
        const created = await adapter.create<User>("users", data, users);

        // Use the centralized QueryBuilder
        const query = queryBuilder<User>().eq("email", "sikandar@test.com").build();
        const result = await adapter.getOne<User>("users", query, users);

        expect(result.id).toBe(created.id);
        expect(result.name).toBe("Sikandar");
    });

    it("should update and delete records using the QueryBuilder", async () => {
        const created = await adapter.create<User>(
            "users",
            { name: "Sikandar", email: "sikandar@test.com", age: 25 },
            users,
        );

        // Update using QueryBuilder
        const updateQuery = queryBuilder<User>().eq("id", created.id).build();
        const updated = await adapter.update<User>("users", updateQuery, { age: 26 }, users);
        expect(updated[0].age).toBe(26);

        // Delete using QueryBuilder
        const deleteQuery = queryBuilder<User>().eq("id", created.id).build();
        await adapter.delete("users", deleteQuery, users);

        const remaining = await adapter.getList<User>("users", undefined, users);
        expect(remaining).toHaveLength(0);
    });
});
