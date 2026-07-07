import type { Entity, Query } from "@crudstack/core";

/**
 * A fluent API for building type-safe Query objects.
 * Matches the new core architecture where fields are top-level keys.
 */
export class QueryBuilder<T extends Entity> {
    // We use a generic record internally to bypass strict mapped type limitations during construction
    private query: Record<string, any> = {};

    /**
     * Adds an equality condition.
     * In the core architecture, a direct value implies an implicit $eq.
     */
    eq<K extends keyof T>(field: K, value: T[K]): this {
        this.query[field as string] = value;
        return this;
    }

    /**
     * Adds a greater than condition.
     */
    gt<K extends keyof T>(field: K, value: T[K]): this {
        if (!this.query[field as string]) this.query[field as string] = {};
        this.query[field as string].$gt = value;
        return this;
    }

    /**
     * Adds a less than condition.
     */
    lt<K extends keyof T>(field: K, value: T[K]): this {
        if (!this.query[field as string]) this.query[field as string] = {};
        this.query[field as string].$lt = value;
        return this;
    }

    /**
     * Adds an IN condition.
     */
    in<K extends keyof T>(field: K, values: T[K][]): this {
        if (!this.query[field as string]) this.query[field as string] = {};
        this.query[field as string].$in = values;
        return this;
    }

    /**
     * Returns the constructed Query object.
     */
    build(): Query<T> {
        return this.query as Query<T>;
    }
}

/**
 * Factory function to create a new QueryBuilder instance with type inference.
 */
export function queryBuilder<T extends Entity>(): QueryBuilder<T> {
    return new QueryBuilder<T>();
}
