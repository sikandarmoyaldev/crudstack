import { createSanityResolver } from "@/modifiers/query/resolver";
import { beforeEach, describe, expect, it } from "vitest";

describe("createSanityResolver", () => {
    // Declare the variable here
    let resolver: ReturnType<typeof createSanityResolver>;

    // Instantiate a fresh resolver before EVERY test
    beforeEach(() => {
        resolver = createSanityResolver();
    });

    it("should return a resolver with all required operators", () => {
        expect(resolver.$eq).toBeInstanceOf(Function);
        expect(resolver.$ne).toBeInstanceOf(Function);
        expect(resolver.$gt).toBeInstanceOf(Function);
        expect(resolver.$gte).toBeInstanceOf(Function);
        expect(resolver.$lt).toBeInstanceOf(Function);
        expect(resolver.$lte).toBeInstanceOf(Function);
        expect(resolver.$in).toBeInstanceOf(Function);
        expect(resolver.$nin).toBeInstanceOf(Function);
    });

    it("should generate correct GROQ and params for $eq", () => {
        const result = resolver.$eq("name", "John");
        expect(result.condition).toBe("name == $p0");
        expect(result.params).toEqual({ p0: "John" });
    });

    it("should generate correct GROQ for $nin (not in)", () => {
        const result = resolver.$nin("status", ["active", "pending"]);
        expect(result.condition).toBe("!(status in $p0)");
        expect(result.params).toEqual({ p0: ["active", "pending"] });
    });
});
