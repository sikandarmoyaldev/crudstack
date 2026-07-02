import { beforeEach, describe, expect, it, vi } from "vitest";

import { CrudStack } from "./crudstack";
import type { DatabaseAdapter, Entity } from "./types";

// 1. Define a mock type for our tests
type User = Entity & { name: string; email: string };

// 2. Create a Mock Database Adapter
const createMockAdapter = (): DatabaseAdapter => ({
    getOne: vi.fn(),
    getList: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
});

describe("CrudStack Core", () => {
    let mockAdapter: DatabaseAdapter;
    let crudstack: CrudStack;

    beforeEach(() => {
        mockAdapter = createMockAdapter();
        crudstack = new CrudStack({ database: mockAdapter });
    });

    describe("Resource Creation", () => {
        it("should create a resource without a schema", () => {
            const usersResource = crudstack.createResource<User>("users");
            expect(usersResource).toBeDefined();
        });

        it("should create a resource using the alias 'resource'", () => {
            const usersResource = crudstack.resource<User>("users");
            expect(usersResource).toBeDefined();
        });
    });

    describe("Resource CRUD Operations (Without Schema)", () => {
        it("should call adapter.create with correct arguments", async () => {
            const users = crudstack.createResource<User>("users");
            const userData = { name: "Sikandar", email: "sikandar@test.com" };

            // Setup mock to return the created user
            vi.mocked(mockAdapter.create).mockResolvedValue({ id: "123", ...userData } as User);

            const result = await users.create(userData);

            // Assert the adapter was called with: (resourceName, data, schema)
            expect(mockAdapter.create).toHaveBeenCalledWith("users", userData, undefined);
            expect(result.id).toBe("123");
        });

        it("should call adapter.getOne with correct arguments", async () => {
            const users = crudstack.createResource<User>("users");
            const query = { $eq: { email: "sikandar@test.com" } };

            await users.getOne(query);

            expect(mockAdapter.getOne).toHaveBeenCalledWith("users", query, undefined);
        });

        it("should call adapter.getList with correct arguments", async () => {
            const users = crudstack.createResource<User>("users");
            const query = { $eq: { name: "Sikandar" } };

            await users.getList(query);

            expect(mockAdapter.getList).toHaveBeenCalledWith("users", query, undefined);
        });

        it("should call adapter.update with correct arguments", async () => {
            const users = crudstack.createResource<User>("users");
            const updateData = { name: "Sikandar Updated" };

            await users.update("123", updateData);

            expect(mockAdapter.update).toHaveBeenCalledWith("users", "123", updateData, undefined);
        });

        it("should call adapter.delete with correct arguments", async () => {
            const users = crudstack.createResource<User>("users");

            await users.delete("123");

            expect(mockAdapter.delete).toHaveBeenCalledWith("users", "123", undefined);
        });
    });

    describe("Resource CRUD Operations (With Schema)", () => {
        it("should pass the schema to the adapter methods", async () => {
            const mockSchema = { type: "users", columns: ["id", "name"] };
            const users = crudstack.createResource<User>("users", mockSchema);
            const userData = { name: "Sikandar", email: "sikandar@test.com" };

            await users.create(userData);

            // Assert the 3rd argument is our mockSchema
            expect(mockAdapter.create).toHaveBeenCalledWith("users", userData, mockSchema);
        });
    });
});
