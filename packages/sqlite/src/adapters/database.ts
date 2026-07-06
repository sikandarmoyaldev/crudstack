import { DatabaseAdapter, Entity, Query } from "@crudstack/core";
import { BaseSQLiteDatabase, SQLiteTable } from "drizzle-orm/sqlite-core";

import { buildQuery } from "../modifiers/query";

export class SQLiteDatabaseAdapter implements DatabaseAdapter {
    constructor(private db: BaseSQLiteDatabase<"sync", any, any>) {}

    async getOne<T extends Entity>(
        _resource: string,
        query: Query<T>,
        schema?: unknown,
    ): Promise<T> {
        const table = schema as SQLiteTable;
        const where = buildQuery(table, query); // Clean and simple

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
        const where = buildQuery(table, query);

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
        const where = buildQuery(table, query);

        const result = await this.db
            .update(table)
            .set(data as any)
            .where(where)
            .returning();
        return result as unknown as T[];
    }

    async delete(_resource: string, query: Query<Entity>, schema?: unknown): Promise<void> {
        const table = schema as SQLiteTable;
        const where = buildQuery(table, query);

        await this.db.delete(table).where(where);
    }
}
