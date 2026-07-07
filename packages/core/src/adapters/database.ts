import type { Query } from "@/modifiers/query";
import type { Entity } from "@/types/entity";

/**
 * The strict contract that ALL database adapters must implement.
 * Adapters are responsible for translating core operations into native database commands.
 */
export interface DatabaseAdapter {
    getOne<T extends Entity>(resource: string, query: Query<T>, schema?: unknown): Promise<T>;
    getList<T extends Entity>(resource: string, query?: Query<T>, schema?: unknown): Promise<T[]>;
    create<T extends Entity>(resource: string, data: Omit<T, "id">, schema?: unknown): Promise<T>;
    update<T extends Entity>(
        resource: string,
        query: Query<T>,
        data: Partial<Omit<T, "id">>,
        schema?: unknown,
    ): Promise<T[]>;
    delete(resource: string, query: Query<Entity>, schema?: unknown): Promise<void>;
}
