import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";

import { createSQLiteResolver } from "@/modifiers/query/resolver";

const mockTable = sqliteTable("mock", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    age: integer("age").notNull(),
});

describe("createSQLiteResolver", () => {
    const resolver = createSQLiteResolver(mockTable);

    it("should return a resolver with all required operators", () => {
        expect(resolver.$eq).toBeInstanceOf(Function);
        expect(resolver.$ne).toBeInstanceOf(Function);
        expect(resolver.$gt).toBeInstanceOf(Function);
        expect(resolver.$gte).toBeInstanceOf(Function);
        expect(resolver.$lt).toBeInstanceOf(Function);
        expect(resolver.$lte).toBeInstanceOf(Function);
        expect(resolver.$in).toBeInstanceOf(Function);
        expect(resolver.$nin).toBeInstanceOf(Function);
    });

    it("should throw an error if the column does not exist in the schema", () => {
        expect(() => resolver.$eq("nonExistentColumn" as any, "value")).toThrow(
            'Column "nonExistentColumn" not found in table schema.',
        );
    });
});
