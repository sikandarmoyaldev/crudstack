import type { Entity } from "@crudstack/core";
import { describe, expect, it } from "vitest";

import { queryBuilder } from "@/modifiers/query/builder";

type User = Entity & { name: string; age: number };

describe("QueryBuilder", () => {
    it("should build a simple implicit $eq query", () => {
        // In the new architecture, direct values imply an implicit $eq
        const query = queryBuilder<User>().eq("name", "John").build();
        expect(query).toEqual({ name: "John" });
    });

    it("should chain multiple implicit $eq conditions", () => {
        const query = queryBuilder<User>().eq("name", "John").eq("age", 25).build();
        expect(query).toEqual({ name: "John", age: 25 });
    });

    it("should build explicit operator queries", () => {
        const query = queryBuilder<User>().gt("age", 18).in("name", ["Alice", "Bob"]).build();

        // Explicit operators are nested under the field name
        expect(query).toEqual({
            age: { $gt: 18 },
            name: { $in: ["Alice", "Bob"] },
        });
    });

    it("should mix implicit and explicit operators", () => {
        const query = queryBuilder<User>().eq("name", "John").gt("age", 18).build();

        expect(query).toEqual({
            name: "John",
            age: { $gt: 18 },
        });
    });
});
