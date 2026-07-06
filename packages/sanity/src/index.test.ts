import type { SanityClient } from "@sanity/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SanityAdapter } from "./index";

// Mock the @sanity/client module
vi.mock("@sanity/client", () => {
    return {
        createClient: vi.fn(() => ({
            fetch: vi.fn(),
            create: vi.fn(),
            patch: vi.fn(() => ({
                set: vi.fn().mockReturnThis(),
                commit: vi.fn(),
            })),
            delete: vi.fn(),
        })),
    };
});

type User = { id: string; name: string; email: string; age: number | null };

describe("SanityAdapter", () => {
    let adapter: SanityAdapter;
    let mockClient: SanityClient;

    // FIX 1: Mark this function as async to allow the use of await
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

    it("should get a single record by query", async () => {
        const sanityDoc = {
            _id: "user-123",
            _type: "user",
            name: "Sikandar",
            email: "sikandar@test.com",
            age: 25,
        };

        // FIX 2: Cast to any to bypass strict Sanity client return types
        vi.mocked(mockClient.fetch).mockResolvedValue(sanityDoc as any);

        const result = await adapter.getOne<User>("user", { $eq: { email: "sikandar@test.com" } });

        expect(mockClient.fetch).toHaveBeenCalledWith("*[_type == $resource && email == $p0][0]", {
            resource: "user",
            p0: "sikandar@test.com",
        });
        expect(result.id).toBe("user-123");
    });

    it("should throw an error if getOne finds no record", async () => {
        vi.mocked(mockClient.fetch).mockResolvedValue(null as any);

        await expect(
            adapter.getOne<User>("user", { $eq: { email: "notfound@test.com" } }),
        ).rejects.toThrow("Record not found in user");
    });

    it("should get a list of records", async () => {
        const docs = [
            { _id: "u1", _type: "user", name: "User 1", email: "u1@test.com", age: 20 },
            { _id: "u2", _type: "user", name: "User 2", email: "u2@test.com", age: 30 },
        ];

        // FIX 3: Cast to any to bypass strict Sanity client return types
        vi.mocked(mockClient.fetch).mockResolvedValue(docs as any);

        const result = await adapter.getList<User>("user");

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("u1");
        expect(result[1].id).toBe("u2");
    });

    it("should update a record by ID", async () => {
        const updatedDoc = {
            _id: "user-123",
            _type: "user",
            name: "Sikandar K",
            email: "sikandar@test.com",
            age: 26,
        };
        const mockCommit = vi.fn().mockResolvedValue(updatedDoc);
        const mockSet = vi.fn().mockReturnValue({ commit: mockCommit });
        const mockPatch = vi.fn().mockReturnValue({ set: mockSet });

        (mockClient.patch as any) = mockPatch;

        const result = await adapter.update<User>("user", "user-123", { age: 26 });

        expect(mockPatch).toHaveBeenCalledWith("user-123");
        expect(mockSet).toHaveBeenCalledWith({ age: 26 });
        expect(result.age).toBe(26);
    });

    it("should delete a record by ID", async () => {
        await adapter.delete("user", "user-123");

        expect(mockClient.delete).toHaveBeenCalledWith("user-123");
    });
});
