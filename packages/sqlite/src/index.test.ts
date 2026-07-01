import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

import { SQLiteAdapter } from "./index";

// 1. Define a test schema with an auto-generated ID
const users = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    age: integer("age"),
});

type User = { id: string; name: string; email: string; age: number | null };

describe("SQLiteAdapter", () => {
    let adapter: SQLiteAdapter;
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
        adapter = new SQLiteAdapter(db);
    });

    it("should create a new record and return it with a generated ID", async () => {
        const data = { name: "Sikandar", email: "sikandar@test.com", age: 25 };
        const result = await adapter.create<User>("users", data, users);

        expect(result).toMatchObject(data);
        expect(result.id).toBeDefined();
        expect(typeof result.id).toBe("string");
    });

    it("should get a single record by query", async () => {
        const created = await adapter.create<User>(
            "users",
            { name: "Sikandar", email: "sikandar@test.com", age: 25 },
            users,
        );

        const result = await adapter.getOne<User>(
            "users",
            { $eq: { email: "sikandar@test.com" } },
            users,
        );

        expect(result.id).toBe(created.id);
        expect(result.name).toBe("Sikandar");
    });

    it("should throw an error if getOne finds no record", async () => {
        await expect(
            adapter.getOne<User>("users", { $eq: { email: "notfound@test.com" } }, users),
        ).rejects.toThrow("Record not found");
    });

    it("should get a list of all records when no query is provided", async () => {
        await adapter.create<User>(
            "users",
            { name: "User 1", email: "u1@test.com", age: 20 },
            users,
        );
        await adapter.create<User>(
            "users",
            { name: "User 2", email: "u2@test.com", age: 30 },
            users,
        );

        const result = await adapter.getList<User>("users", undefined, users);

        expect(result).toHaveLength(2);
    });

    it("should get a filtered list of records using a query", async () => {
        await adapter.create<User>(
            "users",
            { name: "User 1", email: "u1@test.com", age: 20 },
            users,
        );
        await adapter.create<User>(
            "users",
            { name: "User 2", email: "u2@test.com", age: 30 },
            users,
        );

        const result = await adapter.getList<User>("users", { $eq: { age: 30 } }, users);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("User 2");
    });

    it("should update a record by ID", async () => {
        const created = await adapter.create<User>(
            "users",
            { name: "Sikandar", email: "sikandar@test.com", age: 25 },
            users,
        );

        const updated = await adapter.update<User>("users", created.id, { age: 26 }, users);

        expect(updated.age).toBe(26);
        expect(updated.name).toBe("Sikandar"); // Unchanged fields remain intact
    });

    it("should delete a record by ID", async () => {
        const created = await adapter.create<User>(
            "users",
            { name: "Sikandar", email: "sikandar@test.com", age: 25 },
            users,
        );

        await adapter.delete("users", created.id, users);

        const result = await adapter.getList<User>("users", undefined, users);
        expect(result).toHaveLength(0);
    });
});
