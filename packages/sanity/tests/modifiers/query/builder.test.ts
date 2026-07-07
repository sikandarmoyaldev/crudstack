import type { Entity } from "@crudstack/core";
import { describe, expect, it } from "vitest";

import { queryBuilder } from "@/modifiers/query/builder";

type User = Entity & { name: string; age: number };

describe("QueryBuilder", () => {
    it("should build a simple implicit $eq query", () => {
        const query = queryBuilder<User>().eq("name", "John").build();
        expect(query).toEqual({ name: "John" });
    });

    it("should build explicit operator queries", () => {
        const query = queryBuilder<User>().gt("age", 18).in("name", ["Alice", "Bob"]).build();

        expect(query).toEqual({
            age: { $gt: 18 },
            name: { $in: ["Alice", "Bob"] },
        });
    });
});
