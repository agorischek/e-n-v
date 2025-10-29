import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/bundle.ts"],
  noExternal: [/^@e-n-v\//],
});
