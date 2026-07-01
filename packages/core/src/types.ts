/**
 * Base type for all entities. Requires an `id` field.
 */
export type Entity = { id: string };

/**
 * Type-safe query operators.
 * Because it uses `Partial<T>`, TypeScript will strictly enforce
 * that you only query by fields that actually exist on your entity!
 */
export type Query<T extends Entity> = {
    $eq?: Partial<T>;
    // Future operators can be added here easily:
    // $gt?: Partial<T>;
    // $lt?: Partial<T>;
    // $in?: Partial<Record<keyof T, any[]>>;
};

/**
 * The interface that database adapters (Sanity, Firebase, etc.) MUST implement.
 * Notice how it takes the `resource` name as an argument.
 * This allows a single adapter instance to handle multiple resources.
 */
// Add `schema?: unknown` to all methods in the DatabaseAdapter interface
export interface DatabaseAdapter {
    getOne<T extends Entity>(resource: string, query: Query<T>, schema?: unknown): Promise<T>;
    getList<T extends Entity>(resource: string, query?: Query<T>, schema?: unknown): Promise<T[]>;
    create<T extends Entity>(resource: string, data: Omit<T, "id">, schema?: unknown): Promise<T>;
    update<T extends Entity>(
        resource: string,
        id: string,
        data: Partial<Omit<T, "id">>,
        schema?: unknown,
    ): Promise<T>;
    delete(resource: string, id: string, schema?: unknown): Promise<void>;
}

/**
 * The public API returned by `crudstack.createResource()`.
 * This is what developers will use in their Next.js server actions and components.
 */
export interface Resource<T extends Entity> {
    getOne(query: Query<T>): Promise<T>;
    getList(query?: Query<T>): Promise<T[]>;
    create(data: Omit<T, "id">): Promise<T>;
    update(id: string, data: Partial<Omit<T, "id">>): Promise<T>;
    delete(id: string): Promise<void>;
}
