import type { DatabaseAdapter, Entity, Query } from "@crudstack/core";
import type { SanityClient } from "@sanity/client";

export class SanityAdapter implements DatabaseAdapter {
    constructor(private client: SanityClient) {}

    /**
     * Translates the core Query object into a GROQ query string and parameters.
     * Maps the generic 'id' field to Sanity's '_id' field.
     */
    private buildQuery<T extends Entity>(resource: string, query?: Query<T>) {
        let groq = `*[_type == $resource`;
        const params: Record<string, any> = { resource };

        if (query?.$eq) {
            const conditions: string[] = [];
            let paramIndex = 0;
            for (const [key, value] of Object.entries(query.$eq)) {
                if (value === undefined) continue;

                // Map the generic 'id' field to Sanity's '_id'
                const sanityKey = key === "id" ? "_id" : key;
                const paramName = `p${paramIndex++}`;

                conditions.push(`${sanityKey} == $${paramName}`);
                params[paramName] = value;
            }
            if (conditions.length > 0) {
                groq += ` && ${conditions.join(" && ")}`;
            }
        }

        groq += "]";
        return { groq, params };
    }

    /**
     * Maps a Sanity document to the core Entity type by renaming _id to id.
     */
    private mapToEntity<T extends Entity>(doc: any): T {
        if (!doc) return doc;
        const { _id, ...rest } = doc;
        return { id: _id, ...rest } as unknown as T;
    }

    async getOne<T extends Entity>(
        resource: string,
        query: Query<T>,
        schema?: unknown,
    ): Promise<T> {
        const { groq, params } = this.buildQuery(resource, query);
        const result = await this.client.fetch(`${groq}[0]`, params);

        if (!result) {
            throw new Error(`Record not found in ${resource}`);
        }

        return this.mapToEntity<T>(result);
    }

    async getList<T extends Entity>(
        resource: string,
        query?: Query<T>,
        schema?: unknown,
    ): Promise<T[]> {
        const { groq, params } = this.buildQuery(resource, query);
        const results = await this.client.fetch(groq, params);
        return results.map((r: any) => this.mapToEntity<T>(r));
    }

    async create<T extends Entity>(
        resource: string,
        data: Omit<T, "id">,
        schema?: unknown,
    ): Promise<T> {
        // In Sanity, the resource name corresponds to the document _type
        const doc = { _type: resource, ...data };
        const result = await this.client.create(doc as any);
        return this.mapToEntity<T>(result);
    }

    async update<T extends Entity>(
        resource: string,
        id: string,
        data: Partial<Omit<T, "id">>,
        schema?: unknown,
    ): Promise<T> {
        const result = await this.client
            .patch(id)
            .set(data as any)
            .commit();
        return this.mapToEntity<T>(result);
    }

    async delete(resource: string, id: string, schema?: unknown): Promise<void> {
        await this.client.delete(id);
    }
}
