import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  tsconfig: "./tsconfig.json",
  target: "node18",
  sourcemap: true,
  clean: true,
  dts: true,
  minify: false,
  outDir: "dist",
  splitting: false,
  treeshake: true
});
