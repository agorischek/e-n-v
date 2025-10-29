import { describe, it, expect } from "bun:test";
import { resolveSchema } from "@e-n-v/models";
import { z } from "zod";

describe("resolveSchema", () => {
  it("should resolve Zod v3 schemas", () => {
    const zodSchema = z.string();
    const envSchema = resolveSchema(zodSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("string");
    expect(envSchema.required).toBe(true);
  });

  it("should resolve Zod v3 optional schemas", () => {
    const zodSchema = z.string().optional();
    const envSchema = resolveSchema(zodSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("string");
    expect(envSchema.required).toBe(false);
  });

  it("should resolve Zod v3 number schemas", () => {
    const zodSchema = z.number();
    const envSchema = resolveSchema(zodSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("number");
    expect(envSchema.required).toBe(true);
  });

  it("should resolve Zod v3 boolean schemas", () => {
    const zodSchema = z.boolean();
    const envSchema = resolveSchema(zodSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("boolean");
    expect(envSchema.required).toBe(true);
  });

  it("should resolve Zod v3 enum schemas", () => {
    const zodSchema = z.enum(["dev", "prod", "test"]);
    const envSchema = resolveSchema(zodSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("enum");
    expect(envSchema.required).toBe(true);
  });

  it("should throw error for unsupported schemas", () => {
    const unsupportedSchema = { notAZodSchema: true } as any;

    expect(() => resolveSchema(unsupportedSchema)).toThrow(
      "No converter found for schema",
    );
  });
});
