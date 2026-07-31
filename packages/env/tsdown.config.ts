import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/cli.ts",
    "./src/vars.ts",
    "./src/prompt.ts",
    "./src/parse.ts",
    "./src/model.ts",
    "./src/schemas.ts",
    "./src/schemas/zod.ts",
    "./src/files.ts",
    "./src/channels.ts",
    "./src/core.ts",
  ],
  deps: {
    alwaysBundle: [/^@e-n-v\//],
    neverBundle: [/^(joi|superstruct|zod)(\/|$)/],
    onlyBundle: false,
  },
  dts: true,
  outDir: "./dist",
  format: ["esm", "cjs"],
  outExtensions({ format }) {
    return format === "es"
      ? { dts: ".d.ts", js: ".js" }
      : { dts: ".d.cts", js: ".cjs" };
  },
});
