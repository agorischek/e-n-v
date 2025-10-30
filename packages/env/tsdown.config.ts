import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/bundle.ts",
    "./src/cli.ts",
    "./src/vars.ts",
    "./src/prompt.ts",
    "./src/parse.ts",
    "./src/models.ts",
    "./src/schemas.ts",
    "./src/schemas/zod.ts",
    "./src/files.ts",
    "./src/channels.ts",
    "./src/core.ts",
  ],
  noExternal: [/^@e-n-v\//],
  dts: true,
  outDir: "./dist",
  format: ["esm", "cjs"],
});
