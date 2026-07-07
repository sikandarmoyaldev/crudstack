import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

import { SQLiteDatabaseAdapter } from "@/adapters/database";
import { queryBuilder } from "@/modifiers/query";

const users = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    age: integer("age"),
});

type User = { id: string; name: string; email: string; age: number | null };

describe("SQLiteDatabaseAdapter", () => {
    let adapter: SQLiteDatabaseAdapter;
    let sqliteDb: Database.Database;

    beforeEach(() => {
        sqliteDb = new Database(":memory:");
        sqliteDb.exec(`
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                age INTEGER
            );
        `);
        const db = drizzle(sqliteDb);
        adapter = new SQLiteDatabaseAdapter(db);
    });

    it("should create and get a record using the QueryBuilder", async () => {
        const data = { name: "Sikandar", email: "sikandar@test.com", age: 25 };
        const created = await adapter.create<User>("users", data, users);

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

        const updateQuery = queryBuilder<User>().eq("id", created.id).build();
        const updated = await adapter.update<User>("users", updateQuery, { age: 26 }, users);
        expect(updated[0].age).toBe(26);

        const deleteQuery = queryBuilder<User>().eq("id", created.id).build();
        await adapter.delete("users", deleteQuery, users);

        const remaining = await adapter.getList<User>("users", undefined, users);
        expect(remaining).toHaveLength(0);
    });

    it("should support advanced operators like $gt and $in", async () => {
        await adapter.create<User>("users", { name: "Alice", email: "a@test.com", age: 20 }, users);
        await adapter.create<User>("users", { name: "Bob", email: "b@test.com", age: 30 }, users);
        await adapter.create<User>(
            "users",
            { name: "Charlie", email: "c@test.com", age: 40 },
            users,
        );

        // Test $gt
        const olderThan25 = await adapter.getList<User>("users", { age: { $gt: 25 } }, users);
        expect(olderThan25).toHaveLength(2);

        // Test $in
        const specificNames = await adapter.getList<User>(
            "users",
            { name: { $in: ["Alice", "Charlie"] } },
            users,
        );
        expect(specificNames).toHaveLength(2);
    });
});
