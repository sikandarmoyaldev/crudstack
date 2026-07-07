import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            // Map the "@" alias to the "src" directory
            "@": path.resolve(process.cwd(), "src"),
        },
    },
});
