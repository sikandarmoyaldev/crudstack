import type { DatabaseAdapter, Entity, Query } from "@crudstack/core";
import { buildNativeConditions, resolveQuery } from "@crudstack/core";
import type { SanityClient } from "@sanity/client";

import { createSanityResolver, type SanityCondition } from "@/modifiers/query";

export class SanityAdapter implements DatabaseAdapter {
    constructor(private client: SanityClient) {}

    /**
     * Internal helper to translate the core Query<T> into a parameterized GROQ string.
     */
    private buildGroq<T extends Entity>(resource: string, query?: Query<T>) {
        const resolver = createSanityResolver();
        const parsedConditions = resolveQuery(query);

        // Map the generic 'id' field to Sanity's '_id' field
        const mappedConditions = parsedConditions.map((c) => ({
            ...c,
            field: c.field === "id" ? "_id" : c.field,
        }));

        const nativeConditions = buildNativeConditions<SanityCondition>(mappedConditions, resolver);

        let groq = `*[_type == $resource`;
        const params: Record<string, any> = { resource };

        if (nativeConditions.length > 0) {
            const conditionStrings = nativeConditions.map((c) => c.condition);
            groq += ` && ${conditionStrings.join(" && ")}`;

            // Merge all parameter objects into the main params object
            for (const c of nativeConditions) {
                Object.assign(params, c.params);
            }
        }

        groq += "]";
        return { groq, params };
    }

    /**
     * Normalizes a raw Sanity document into a clean Entity.
     * Maps '_id' to 'id' and strips internal Sanity metadata fields.
     */
    private normalizeDocument<T extends Entity>(doc: any): T {
        if (!doc) return doc;
        const { _id, _type, _createdAt, _updatedAt, _rev, ...rest } = doc;
        return { id: _id, ...rest } as unknown as T;
    }

    async getOne<T extends Entity>(
        resource: string,
        query: Query<T>,
        _schema?: unknown,
    ): Promise<T> {
        const { groq, params } = this.buildGroq(resource, query);
        const result = await this.client.fetch(`${groq}[0]`, params);

        if (!result) {
            throw new Error(`Record not found in ${resource}`);
        }

        return this.normalizeDocument<T>(result);
    }

    async getList<T extends Entity>(
        resource: string,
        query?: Query<T>,
        _schema?: unknown,
    ): Promise<T[]> {
        const { groq, params } = this.buildGroq(resource, query);
        const results = await this.client.fetch(groq, params);
        return results.map((r: any) => this.normalizeDocument<T>(r));
    }

    async create<T extends Entity>(
        resource: string,
        data: Omit<T, "id">,
        _schema?: unknown,
    ): Promise<T> {
        // In Sanity, the resource name corresponds to the document _type
        const doc = { _type: resource, ...data };
        const result = await this.client.create(doc as any);
        return this.normalizeDocument<T>(result);
    }

    async update<T extends Entity>(
        resource: string,
        query: Query<T>,
        data: Partial<Omit<T, "id">>,
        _schema?: unknown,
    ): Promise<T[]> {
        // 1. Fetch the IDs of all documents matching the query
        const { groq, params } = this.buildGroq(resource, query);
        const ids: string[] = await this.client.fetch(`${groq}._id`, params);

        if (ids.length === 0) return [];

        // 2. Use a Sanity Transaction to update all matched records efficiently
        const transaction = this.client.transaction();
        for (const id of ids) {
            transaction.patch(id, { set: data as any });
        }
        await transaction.commit();

        // 3. Fetch and return the newly updated documents
        const updatedDocs = await this.client.fetch(`*[_id in $ids]`, { ids });
        return updatedDocs.map((r: any) => this.normalizeDocument<T>(r));
    }

    // FIX: Add <T extends Entity> to match the core interface
    async delete<T extends Entity>(
        resource: string,
        query: Query<T>,
        _schema?: unknown,
    ): Promise<void> {
        // 1. Fetch the IDs of all documents matching the query
        const { groq, params } = this.buildGroq(resource, query);
        const ids: string[] = await this.client.fetch(`${groq}._id`, params);

        if (ids.length === 0) return;

        // 2. Use a Sanity Transaction to delete all matched records efficiently
        const transaction = this.client.transaction();
        for (const id of ids) {
            transaction.delete(id);
        }
        await transaction.commit();
    }
}
