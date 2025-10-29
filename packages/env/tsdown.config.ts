import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/bundle.ts", "./src/cli.ts"],
  noExternal: [/^@e-n-v\//],
  dts: true,
  outDir: "./dist",
  format: ["esm", "cjs"],
});
