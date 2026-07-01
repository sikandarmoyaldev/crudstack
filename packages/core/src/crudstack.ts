import { ResourceImpl } from "./resource";
import type { DatabaseAdapter, Entity, Resource } from "./types";

export interface CrudStackConfig {
    database: DatabaseAdapter;
    // auth: AuthAdapter; // Reserved for future implementation
}

/**
 * The main entry point for Crudstack.
 * Holds the database adapter and provides a factory for creating type-safe resources.
 */
export class CrudStack {
    private db: DatabaseAdapter;

    constructor(config: CrudStackConfig) {
        this.db = config.database;
    }

    /**
     * Creates a type-safe resource instance for CRUD operations.
     *
     * @param name The name of the resource (e.g., 'users', 'posts', or Sanity _type)
     * @returns A Resource instance with getOne, getList, create, update, and delete methods.
     *
     * @example
     * const users = crudstack.createResource<User>('users');
     * const user = await users.getOne({ $eq: { email: 'test@example.com' } });
     */
    createResource<T extends Entity>(name: string, schema?: unknown): Resource<T> {
        return new ResourceImpl<T>(name, this.db, schema);
    }

    /**
     * Alias for `createResource` for a cleaner API.
     */
    resource<T extends Entity>(name: string): Resource<T> {
        return this.createResource<T>(name);
    }
}
