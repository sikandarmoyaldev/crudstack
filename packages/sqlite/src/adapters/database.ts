import type { DatabaseAdapter, Entity, Query } from "@crudstack/core";
import { buildNativeConditions, resolveQuery } from "@crudstack/core";
import { and } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { createSQLiteResolver } from "@/modifiers/query/resolver";

/**
 * The SQLite implementation of the core DatabaseAdapter interface.
 * Uses Drizzle ORM to execute type-safe SQL queries.
 */
export class SQLiteDatabaseAdapter implements DatabaseAdapter {
    constructor(private db: BetterSQLite3Database<any>) {}

    /**
     * Internal helper to translate the core Query<T> into Drizzle SQL WHERE clauses.
     * It leverages the core's resolveQuery and the SQLite-specific operator resolver.
     */
    private buildWhere<T extends Entity>(table: SQLiteTable, query?: Query<T>) {
        const resolver = createSQLiteResolver(table);
        const parsedConditions = resolveQuery(query);
        const nativeConditions = buildNativeConditions(parsedConditions, resolver);

        return nativeConditions.length > 0 ? and(...nativeConditions) : undefined;
    }

    async getOne<T extends Entity>(
        _resource: string,
        query: Query<T>,
        schema?: unknown,
    ): Promise<T> {
        const table = schema as SQLiteTable;
        const where = this.buildWhere(table, query);

        const result = await this.db.select().from(table).where(where).limit(1);
        if (!result[0]) throw new Error(`Record not found`);
        return result[0] as unknown as T;
    }

    async getList<T extends Entity>(
        _resource: string,
        query?: Query<T>,
        schema?: unknown,
    ): Promise<T[]> {
        const table = schema as SQLiteTable;
        const where = this.buildWhere(table, query);

        const result = await this.db.select().from(table).where(where);
        return result as unknown as T[];
    }

    async create<T extends Entity>(
        _resource: string,
        data: Omit<T, "id">,
        schema?: unknown,
    ): Promise<T> {
        const table = schema as SQLiteTable;
        const result = await this.db
            .insert(table)
            .values(data as any)
            .returning();
        return result[0] as unknown as T;
    }

    async update<T extends Entity>(
        _resource: string,
        query: Query<T>,
        data: Partial<Omit<T, "id">>,
        schema?: unknown,
    ): Promise<T[]> {
        const table = schema as SQLiteTable;
        const where = this.buildWhere(table, query);

        const result = await this.db
            .update(table)
            .set(data as any)
            .where(where)
            .returning();
        return result as unknown as T[];
    }

    async delete(_resource: string, query: Query<Entity>, schema?: unknown): Promise<void> {
        const table = schema as SQLiteTable;
        const where = this.buildWhere(table, query);

        await this.db.delete(table).where(where);
    }
}
