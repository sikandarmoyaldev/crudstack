import { DatabaseAdapter, Entity, Query } from "@crudstack/core";
import { and, eq, SQL } from "drizzle-orm";
import { BaseSQLiteDatabase, SQLiteTable } from "drizzle-orm/sqlite-core";

export class SQLiteAdapter implements DatabaseAdapter {
    constructor(private db: BaseSQLiteDatabase<"sync", any, any>) {}

    /**
     * Translates the core Query object into Drizzle WHERE clauses
     */
    private buildWhere<T extends Entity>(table: SQLiteTable, query?: Query<T>) {
        if (!query?.$eq) return undefined;

        const conditions: SQL[] = [];
        for (const [key, value] of Object.entries(query.$eq)) {
            if (value === undefined) continue;

            // Dynamically get the column from the Drizzle table schema
            // @ts-expect-error - dynamic column access
            const column = table[key];
            if (column) {
                conditions.push(eq(column, value));
            }
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    }

    /**
     * Helper to dynamically get the 'id' column from the table schema
     */
    private getIdColumn(table: SQLiteTable) {
        // @ts-expect-error - dynamic column access for primary key
        const idColumn = table["id"];
        if (!idColumn) {
            throw new Error(
                "The provided table schema must have an 'id' column as the primary key.",
            );
        }
        return idColumn;
    }

    async getOne<T extends Entity>(
        resource: string,
        query: Query<T>,
        schema?: unknown,
    ): Promise<T> {
        const table = schema as SQLiteTable;
        const where = this.buildWhere(table, query);
        const result = await this.db.select().from(table).where(where).limit(1);

        if (!result[0]) throw new Error(`Record not found in ${resource}`);
        return result[0] as unknown as T;
    }

    async getList<T extends Entity>(
        _resource: string, // Prefixed with _ because it's not used in this method
        query?: Query<T>,
        schema?: unknown,
    ): Promise<T[]> {
        const table = schema as SQLiteTable;
        const where = this.buildWhere(table, query);
        const result = await this.db.select().from(table).where(where);
        return result as unknown as T[];
    }

    async create<T extends Entity>(
        _resource: string, // Prefixed with _
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
        _resource: string, // Prefixed with _
        id: string,
        data: Partial<Omit<T, "id">>,
        schema?: unknown,
    ): Promise<T> {
        const table = schema as SQLiteTable;
        const idColumn = this.getIdColumn(table); // Dynamically get the ID column

        const result = await this.db
            .update(table)
            .set(data as any)
            .where(eq(idColumn, id)) // Use the dynamically retrieved column
            .returning();
        return result[0] as unknown as T;
    }

    async delete(_resource: string, id: string, schema?: unknown): Promise<void> {
        const table = schema as SQLiteTable;
        const idColumn = this.getIdColumn(table); // Dynamically get the ID column

        await this.db.delete(table).where(eq(idColumn, id)); // Use the dynamically retrieved column
    }
}
