import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "./src/index.ts",
        "./src/schema/index.ts",
        "./src/utils/index.ts",
        "./src/errors/index.ts"
    ],
    format: ["esm", "cjs"],
    clean: true,
    dts: true,
    splitting: false,
    keepNames: true,
    outDir: "./lib",
});
