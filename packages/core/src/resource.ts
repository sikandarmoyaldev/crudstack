import type { DatabaseAdapter, Entity, Query, Resource } from "./types";

/**
 * Internal implementation of the Resource interface.
 * Delegates all calls to the underlying DatabaseAdapter.
 */
export class ResourceImpl<T extends Entity> implements Resource<T> {
    constructor(
        private readonly resourceName: string,
        private readonly adapter: DatabaseAdapter,
        private readonly schema?: unknown, // Added schema
    ) {}

    getOne(query: Query<T>): Promise<T> {
        return this.adapter.getOne<T>(this.resourceName, query, this.schema);
    }

    getList(query?: Query<T>): Promise<T[]> {
        return this.adapter.getList<T>(this.resourceName, query, this.schema);
    }

    create(data: Omit<T, "id">): Promise<T> {
        return this.adapter.create<T>(this.resourceName, data, this.schema);
    }

    update(id: string, data: Partial<Omit<T, "id">>): Promise<T> {
        return this.adapter.update<T>(this.resourceName, id, data, this.schema);
    }

    delete(id: string): Promise<void> {
        return this.adapter.delete(this.resourceName, id, this.schema);
    }
}
