import type { QueryOperatorResolver } from "@crudstack/core";
import { eq, gt, gte, inArray, lt, lte, ne, notInArray, type SQL } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

/**
 * Creates a SQLite-specific QueryOperatorResolver bound to a Drizzle table schema.
 * This maps core query operators (like $eq, $gt) to Drizzle's SQL functions.
 */
export function createSQLiteResolver(table: SQLiteTable): QueryOperatorResolver<SQL> {
    const getColumn = (field: string) => {
        // @ts-expect-error - dynamic column access
        const col = table[field];
        if (!col) throw new Error(`Column "${field}" not found in table schema.`);
        return col;
    };

    return {
        $eq: (field, value) => eq(getColumn(field), value),
        $ne: (field, value) => ne(getColumn(field), value),
        $gt: (field, value) => gt(getColumn(field), value),
        $gte: (field, value) => gte(getColumn(field), value),
        $lt: (field, value) => lt(getColumn(field), value),
        $lte: (field, value) => lte(getColumn(field), value),
        $in: (field, value) => inArray(getColumn(field), value as any[]),
        $nin: (field, value) => notInArray(getColumn(field), value as any[]),
    };
}
