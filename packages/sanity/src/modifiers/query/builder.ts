import type { Entity, Query } from "@crudstack/core";

/**
 * A fluent API for building type-safe Query objects.
 */
export class QueryBuilder<T extends Entity> {
    private query: Record<string, any> = {};

    eq<K extends keyof T>(field: K, value: T[K]): this {
        this.query[field as string] = value;
        return this;
    }

    gt<K extends keyof T>(field: K, value: T[K]): this {
        if (!this.query[field as string]) this.query[field as string] = {};
        this.query[field as string].$gt = value;
        return this;
    }

    lt<K extends keyof T>(field: K, value: T[K]): this {
        if (!this.query[field as string]) this.query[field as string] = {};
        this.query[field as string].$lt = value;
        return this;
    }

    in<K extends keyof T>(field: K, values: T[K][]): this {
        if (!this.query[field as string]) this.query[field as string] = {};
        this.query[field as string].$in = values;
        return this;
    }

    build(): Query<T> {
        return this.query as Query<T>;
    }
}

export function queryBuilder<T extends Entity>(): QueryBuilder<T> {
    return new QueryBuilder<T>();
}
