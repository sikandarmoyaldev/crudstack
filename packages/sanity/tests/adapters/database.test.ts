import type { SanityClient } from "@sanity/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SanityAdapter } from "@/adapters/database";

vi.mock("@sanity/client", () => {
    return {
        createClient: vi.fn(() => ({
            fetch: vi.fn(),
            create: vi.fn(),
            transaction: vi.fn(() => ({
                patch: vi.fn().mockReturnThis(),
                delete: vi.fn().mockReturnThis(),
                commit: vi.fn().mockResolvedValue({}),
            })),
        })),
    };
});

type User = { id: string; name: string; email: string; age: number | null };

describe("SanityAdapter", () => {
    let adapter: SanityAdapter;
    let mockClient: SanityClient;

    beforeEach(async () => {
        const { createClient } = await import("@sanity/client");
        mockClient = createClient({
            projectId: "test-project",
            dataset: "test-dataset",
            apiVersion: "2023-05-03",
            useCdn: false,
        });
        adapter = new SanityAdapter(mockClient);
        vi.clearAllMocks();
    });

    it("should create a new record and map _id to id", async () => {
        const data = { name: "Sikandar", email: "sikandar@test.com", age: 25 };
        const sanityResponse = { _id: "user-123", _type: "user", ...data };
        vi.mocked(mockClient.create).mockResolvedValue(sanityResponse as any);

        const result = await adapter.create<User>("user", data);

        expect(mockClient.create).toHaveBeenCalledWith({ _type: "user", ...data });
        expect(result.id).toBe("user-123");
        expect(result.name).toBe("Sikandar");
    });

    it("should get a single record using the new implicit $eq query structure", async () => {
        const sanityDoc = {
            _id: "user-123",
            _type: "user",
            name: "Sikandar",
            email: "sikandar@test.com",
            age: 25,
        };
        vi.mocked(mockClient.fetch).mockResolvedValue(sanityDoc as any);

        // New query structure: direct value implies $eq
        const result = await adapter.getOne<User>("user", { email: "sikandar@test.com" });

        expect(mockClient.fetch).toHaveBeenCalledWith("*[_type == $resource && email == $p0][0]", {
            resource: "user",
            p0: "sikandar@test.com",
        });
        expect(result.id).toBe("user-123");
    });

    it("should update multiple records using a query and transactions", async () => {
        const updatedDocs = [
            { _id: "u1", _type: "user", name: "Updated 1", email: "u1@test.com", age: 26 },
            { _id: "u2", _type: "user", name: "Updated 2", email: "u2@test.com", age: 26 },
        ];

        // Mock fetch for getting IDs
        vi.mocked(mockClient.fetch).mockResolvedValueOnce(["u1", "u2"] as any);
        // Mock fetch for getting updated docs
        vi.mocked(mockClient.fetch).mockResolvedValueOnce(updatedDocs as any);

        const mockTransaction = {
            patch: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            commit: vi.fn().mockResolvedValue({}),
        };
        vi.mocked(mockClient.transaction).mockReturnValue(mockTransaction as any);

        // Update all users with age 25
        const result = await adapter.update<User>("user", { age: 25 }, { age: 26 });

        expect(mockClient.fetch).toHaveBeenCalledWith("*[_type == $resource && age == $p0]._id", {
            resource: "user",
            p0: 25,
        });
        expect(mockTransaction.patch).toHaveBeenCalledTimes(2);
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("u1");
    });

    it("should delete multiple records using a query and transactions", async () => {
        vi.mocked(mockClient.fetch).mockResolvedValue(["u1", "u2"] as any);

        const mockTransaction = {
            patch: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            commit: vi.fn().mockResolvedValue({}),
        };
        vi.mocked(mockClient.transaction).mockReturnValue(mockTransaction as any);

        // FIX: Explicitly pass <User> so TypeScript knows 'age' is a valid field
        await adapter.delete<User>("user", { age: 25 });

        expect(mockClient.fetch).toHaveBeenCalledWith("*[_type == $resource && age == $p0]._id", {
            resource: "user",
            p0: 25,
        });
        expect(mockTransaction.delete).toHaveBeenCalledTimes(2);
        expect(mockTransaction.commit).toHaveBeenCalled();
    });
});
