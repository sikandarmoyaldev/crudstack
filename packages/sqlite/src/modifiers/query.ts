import type { Entity, Query } from "@crudstack/core";
import { and, eq, SQL } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

/**
 * 1. THE BUILDER: Fluent API for developers to create queries
 */
export class QueryBuilder<T extends Entity> {
    private query: Query<T> = {};

    eq<K extends keyof T>(field: K, value: T[K]): this {
        if (!this.query.$eq) this.query.$eq = {};
        this.query.$eq[field] = value;
        return this;
    }

    build(): Query<T> {
        return this.query;
    }
}

export function queryBuilder<T extends Entity>(): QueryBuilder<T> {
    return new QueryBuilder<T>();
}

/**
 * 2. THE TRANSLATOR: Converts the abstract Query object into Drizzle SQL
 * Centralized here so the adapter doesn't have to deal with the translation logic.
 */
export function buildQuery<T extends Entity>(
    table: SQLiteTable,
    query?: Query<T>,
): SQL | undefined {
    if (!query?.$eq) return undefined;

    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(query.$eq)) {
        if (value === undefined) continue;

        // @ts-expect-error - dynamic column access
        const column = table[key];
        if (column) {
            conditions.push(eq(column, value));
        }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
}
