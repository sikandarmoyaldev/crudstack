import type { DatabaseAdapter } from "@/adapters/database";
import { Resource, ResourceImpl } from "@/resources";
import type { Entity } from "@/types/entity";

/**
 * Configuration required to initialize a CrudStack instance.
 */
export interface CrudStackConfig {
    database: DatabaseAdapter;
}

/**
 * The main entry point for the Crudstack library.
 * Acts as an orchestrator, holding the database adapter and providing
 * a factory for creating type-safe resource instances.
 */
export class CrudStack {
    private readonly db: DatabaseAdapter;

    constructor(config: CrudStackConfig) {
        this.db = config.database;
    }

    /**
     * Creates a type-safe resource instance for CRUD operations.
     */
    public createResource<T extends Entity>(name: string, schema?: unknown): Resource<T> {
        return new ResourceImpl<T>(name, this.db, schema);
    }

    /**
     * Alias for `createResource` to provide a cleaner, more concise API.
     */
    public resource<T extends Entity>(name: string, schema?: unknown): Resource<T> {
        return this.createResource<T>(name, schema);
    }
}
