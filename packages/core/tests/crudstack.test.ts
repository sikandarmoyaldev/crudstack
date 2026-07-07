import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseAdapter } from "@/adapters/database";
import { CrudStack } from "@/crudstack";
import type { Entity } from "@/types/entity";

type User = Entity & { name: string; age: number };

describe("CrudStack", () => {
    let mockAdapter: DatabaseAdapter;
    let crudstack: CrudStack;

    beforeEach(() => {
        // Cast the mock object to avoid vi.fn() type inference issues
        mockAdapter = {
            getOne: vi.fn(),
            getList: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        } as unknown as DatabaseAdapter;

        crudstack = new CrudStack({ database: mockAdapter });
    });

    describe("createResource", () => {
        it("should create a resource with all CRUD methods", () => {
            const users = crudstack.createResource<User>("users");

            expect(users).toBeDefined();
            expect(users.getOne).toBeInstanceOf(Function);
            expect(users.getList).toBeInstanceOf(Function);
            expect(users.create).toBeInstanceOf(Function);
            expect(users.update).toBeInstanceOf(Function);
            expect(users.delete).toBeInstanceOf(Function);
        });

        it("should pass schema to resource", () => {
            const mockSchema = { type: "users" };
            const users = crudstack.createResource<User>("users", mockSchema);

            users.getList();
            expect(mockAdapter.getList).toHaveBeenCalledWith("users", undefined, mockSchema);
        });
    });

    describe("resource alias", () => {
        it("should create a resource using resource() method", () => {
            const users = crudstack.resource<User>("users");

            expect(users).toBeDefined();
            expect(users.getOne).toBeInstanceOf(Function);
        });

        it("should work identically to createResource", () => {
            const users1 = crudstack.createResource<User>("users");
            const users2 = crudstack.resource<User>("users");

            users1.getList();
            users2.getList();

            expect(mockAdapter.getList).toHaveBeenCalledTimes(2);
        });
    });

    describe("integration", () => {
        it("should allow full CRUD workflow", async () => {
            const users = crudstack.createResource<User>("users");

            // Create
            const newUser = { name: "John", age: 25 };
            // FIX: Cast to User to satisfy TypeScript
            vi.mocked(mockAdapter.create).mockResolvedValue({ id: "1", ...newUser } as User);
            const created = await users.create(newUser);
            expect(created.id).toBe("1");

            // Read
            vi.mocked(mockAdapter.getOne).mockResolvedValue(created);
            const found = await users.getOne({ name: "John" });
            expect(found.name).toBe("John");

            // Update
            // FIX: Cast the array to User[] because vi.mocked loses the <User> generic context
            vi.mocked(mockAdapter.update).mockResolvedValue([{ ...created, age: 26 }] as User[]);
            const updated = await users.update({ name: "John" }, { age: 26 });
            expect(updated[0].age).toBe(26);

            // Delete
            await users.delete({ name: "John" });
            expect(mockAdapter.delete).toHaveBeenCalled();
        });
    });
});
